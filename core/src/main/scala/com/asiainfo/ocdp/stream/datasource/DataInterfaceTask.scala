package com.asiainfo.ocdp.stream.datasource

import java.util.NoSuchElementException
import java.util.concurrent._

import com.asiainfo.ocdp.stream.common.{BroadcastManager, EventCycleLife}
import com.asiainfo.ocdp.stream.config.{DataInterfaceConf, DataSchema, MainFrameConf, TaskConf}
import com.asiainfo.ocdp.stream.constant.{CommonConstant, DataSourceConstant}
import com.asiainfo.ocdp.stream.event.Event
import com.asiainfo.ocdp.stream.label.LabelManager
import com.asiainfo.ocdp.stream.manager.StreamTask
import com.asiainfo.ocdp.stream.service.{DataInterfaceServer, TaskServer}
import com.asiainfo.ocdp.stream.tools._
import com.asiainfo.ocdp.stream.common.ComFunc
import org.apache.commons.lang.{StringEscapeUtils, StringUtils}
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, Row}
import org.apache.spark.streaming.{StreamingContext, Time}
import org.apache.spark.{Accumulator, HashPartitioner, SparkContext}
import org.apache.spark.streaming.kafka010.{CanCommitOffsets, OffsetRange => OffsetRange010, HasOffsetRanges => HasOffsetRanges010}
import org.apache.commons.codec.digest.DigestUtils

import scala.collection.mutable.ArrayBuffer
import scala.reflect.ClassTag
import scala.util.{Failure, Success, Try}

/**
 * Created by surq on 12/09/15
 */
class DataInterfaceTask(taskConf: TaskConf) extends StreamTask {

  val taskDiid = taskConf.getDiid
  val interval = taskConf.getReceive_interval
  val taskID = taskConf.getId

  val dataInterfaceService = new DataInterfaceServer

  val conf = dataInterfaceService.getDataInterfaceInfoById(taskDiid)
  val labels = dataInterfaceService.getLabelsByIFId(taskDiid)

  var events: Array[Event] = new Array[Event](0)

  conf.setInterval(interval)

  private def transform[T: ClassTag](input: T, dataSchema: DataSchema, broadDiConf:DataInterfaceConf,
                                     totalRecordsCounter: Accumulator[Long], reservedRecordsCounter: Accumulator[Long]): Option[(String, Array[String])] = {

    val delim = dataSchema.getDelim
    val raw = input.asInstanceOf[ConsumerRecord[String, String]]
    val topic = raw.topic()
    val source = raw.value()
    val inputArr = StringUtils.splitByWholeSeparatorPreserveAllTokens(source,StringEscapeUtils.unescapeJava(delim))
    val schema = dataSchema.getRawSchema.fieldNames
    val commonSchema = broadDiConf.getCommonSchema

    totalRecordsCounter.add(1)

    val valid = {
      if (CommonConstant.MulTopic) topic == dataSchema.getTopic && inputArr.size == dataSchema.getRawSchemaSize
      else inputArr.size == dataSchema.getRawSchemaSize
    }

    if (valid) {
      reservedRecordsCounter.add(1)
      val message = for(field <- commonSchema.fieldNames if schema.indexOf(field) >=0)
        yield inputArr(schema.indexOf(field))
      Some((raw.key, message))
    } else {
      None
    }
  }

  private def confCheck() = {
    /*
     * check the conf in Driver
     * try to get the conf we needed
     * */

    val uniqKeys = conf.get("uniqKeys")

    if (StringUtils.isEmpty(uniqKeys))
      throw new Exception("uniqueKeys is not set!!!")

    val dsconf = conf.getDsConf
    val groupID = {
      try {
        dsconf.get(DataSourceConstant.GROUP_ID_KEY)
      } catch {
        case ex: NoSuchElementException => {
          logWarning(s"Can not find ${DataSourceConstant.GROUP_ID_KEY}")
          StringUtils.EMPTY
        }
      }
    }

    if (StringUtils.isEmpty(groupID)) {
      val def_group_name = DataSourceConstant.GROUP_ID_DEF + taskConf.getId + DigestUtils.md5Hex(taskConf.getName).substring(0, 8)
      logWarning("no group_id , use default : " + def_group_name)
      dsconf.set(DataSourceConstant.GROUP_ID_KEY, def_group_name)
    }
  }

  private def toDataFrame[R: ClassTag](rdd: RDD[R]
                      , ssc: SparkContext
                      , totalRecordsCounter: Accumulator[Long]
                      , reservedRecordsCounter: Accumulator[Long]): DataFrame = {

    var unionRDD : RDD[(String, Array[String])] = null
    val broadDiConf = BroadcastManager.getBroadDiConf()
    val dataSchemas = broadDiConf.value.getDataSchemas
    val partitionsList = ArrayBuffer[Int]()

    val df = if(dataSchemas.length == 1){
      val rowRDD = withUptime("1.kafka RDD transformed to rowRDD via single mode"){
        rdd.map( input => {
          transform(input, dataSchemas(0), totalRecordsCounter, reservedRecordsCounter)
        }).collect { case Some(row) => row }
      }

      ComFunc.Func.createDataFrame(ssc, rowRDD, dataSchemas(0).rawSchema)
    }
    else{
      for (dataSchema <- dataSchemas) {

        val kvRDD = withUptime("1.kafka RDD 转换成 rowRDD"){
          rdd.map( input => {
            transform(input, dataSchema, broadDiConf.value, totalRecordsCounter, reservedRecordsCounter)
          }).collect { case Some(row) => row }
        }

        partitionsList += kvRDD.partitions.length

        if (kvRDD.partitions.size > 0) {

          if (null == unionRDD)
            unionRDD = kvRDD
          else
            unionRDD = unionRDD.union(kvRDD)

        } else
          println("当前时间片内正确输入格式的流数据为空, 不做任何处理.")
      }

      var repartition_unionRDD: RDD[(String, Array[String])] = null
      if (dataSchemas.length>1){
        var numPartitions = broadDiConf.value.getNumPartitions
        if (numPartitions <= 0){
          numPartitions = partitionsList.max
        }

        logInfo(s"repartition to ${numPartitions} which is max of ${partitionsList} since there are ${dataSchemas.length} data schemas.")

        repartition_unionRDD = unionRDD.partitionBy(new HashPartitioner(numPartitions))
      }
      else{
        repartition_unionRDD = unionRDD
      }

      val rowRDD = repartition_unionRDD.map(input => Row.fromSeq(input._2))

      ComFunc.Func.createDataFrame(ssc, rowRDD, conf.getCommonSchema)
    }

    val filter_expr = conf.get("filter_expr")

    logInfo(s"All fields is ${conf.getAllItemsSchema.fieldNames.toList}")

    withUptime("3.DataFrame 最初过滤不规则数据"){
      if (StringUtils.isNotEmpty(filter_expr))
        df.selectExpr(conf.getAllItemsSchema.fieldNames: _*).filter(filter_expr)
      else
        df.selectExpr(conf.getAllItemsSchema.fieldNames: _*)
    }

  }

  private def transform[T: ClassTag](input: T, dataSchema: DataSchema,
                                     totalRecordsCounter: Accumulator[Long], reservedRecordsCounter: Accumulator[Long]): Option[Row] = {

    val delim = dataSchema.getDelim
    val raw = input.asInstanceOf[ConsumerRecord[String, String]]
    val topic = raw.topic()
    val source = raw.value()
    val inputArr = StringUtils.splitByWholeSeparatorPreserveAllTokens(source,StringEscapeUtils.unescapeJava(delim))

    totalRecordsCounter.add(1)

    val valid = {
      if (CommonConstant.MulTopic) topic == dataSchema.getTopic && inputArr.size == dataSchema.getRawSchemaSize
      else inputArr.size == dataSchema.getRawSchemaSize
    }

    if (valid) {
      reservedRecordsCounter.add(1)
      Some(Row.fromSeq(inputArr))
    } else {
      None
    }
  }

  final def process(ssc: StreamingContext) = {

    // check the config first
    confCheck()

    val kerberos_enable = MainFrameConf.systemProps.getBoolean(MainFrameConf.KERBEROS_ENABLE, false)
    val kafka_kerberos_enable = if (kerberos_enable) MainFrameConf.systemProps.getBoolean(MainFrameConf.KAFKA_KERBEROS_ENABLE, true)
                                else false
    val latest = taskConf.getRecovery_mode() == "from_latest";

    //1 根据输入数据接口配置，生成数据流 DStream
    val dataSource = new KafkaReader(ssc, conf, kafka_kerberos_enable, latest)
    val inputStream = dataSource.createStreamMulData(taskConf)

    //1.2 根据输入数据接口配置，生成构造 sparkSQL DataFrame 的 structType
    // 全量字段: baseItems + udfItems

    //Broad cast configuration from driver to executor
    BroadcastManager.broadcastDiConf(conf)
    BroadcastManager.broadcastLabels(labels)
    BroadcastManager.broadcastSystemProps(MainFrameConf.systemProps)
    BroadcastManager.broadcastCodisProps(MainFrameConf.codisProps)
    BroadcastManager.broadcastTaskConf(taskConf)

    val totalRecordsCounter = TotalRecordsCounter.getInstance(ssc.sparkContext)
    val reservedRecordsCounter = ReservedRecordsCounter.getInstance(ssc.sparkContext)

    val taskServer = new TaskServer

    //2 流数据处理
    inputStream.foreachRDD((rdd, time: Time) => {
      //2.1 流数据转换
      val broadDiConf = BroadcastManager.getBroadDiConf()
      val dataSchemas = broadDiConf.value.getDataSchemas

      taskServer.updateHeartbeat(taskID)

      val currentReservedRecordsCounterValue = reservedRecordsCounter.value

      val offsetArray = rdd.asInstanceOf[HasOffsetRanges010].offsetRanges

      OffsetStatistics.getSatisticsInfo(offsetArray)

      //2.1 流数据转换
      val mixDF = toDataFrame(rdd, ssc.sparkContext, totalRecordsCounter, reservedRecordsCounter)

      if (null != mixDF) {

        if (labels.size > 0) {
          val labelRDD = withUptime("4.dataframe 转成rdd打标"){
            LabelManager.execLabels(mixDF)
          }

          labelRDD.persist()

          // read.json为spark sql 动作类提交job
          val enhancedDF = withUptime("5.RDD 转换成 DataFrame"){
            ComFunc.Func.toJsonDFrame(ssc.sparkContext, labelRDD)
          }

          withUptime("6.所有业务营销"){
            makeEvents(enhancedDF, conf.get("uniqKeys"))
          }

          labelRDD.unpersist()
        }
        else {
          mixDF.persist()
          val availableRecords = mixDF.count()
          reservedRecordsCounter.setValue(currentReservedRecordsCounterValue + availableRecords)

          withUptime("4.所有业务营销"){
            makeEvents(mixDF, conf.get("uniqKeys"))
          }
          mixDF.unpersist()
        }

        val droppedCount = totalRecordsCounter.value/dataSchemas.length - reservedRecordsCounter.value
        logInfo(s"Dropped ${droppedCount} records since their schema size do not matching records field size.")
        logInfo(s"Reserved ${reservedRecordsCounter.value} records successfully.")

        var maxMem = 0L
        var memUsed = 0L
        var memRemaining = 0L

        ssc.sparkContext.getExecutorStorageStatus.foreach(mem => {
          maxMem = maxMem + mem.maxMem
          memUsed = memUsed + mem.memUsed
          memRemaining = memRemaining + mem.memRemaining
        })

        if (MainFrameConf.systemProps.getBoolean(MainFrameConf.MONITOR_TASK_MONITOR_ENABLE, false)){
          logInfo(s"time.milliseconds = ${time.milliseconds}")
          MonitorUtils.outputTaskStatistics(taskConf.id, (time.milliseconds/1000).toString,
            reservedRecordsCounter.value,
            droppedCount,
            ssc.sparkContext.applicationId,
            maxMem,
            memUsed,
            memRemaining,
            (System.currentTimeMillis() - time.milliseconds))
        }
        inputStream.asInstanceOf[CanCommitOffsets].commitAsync(offsetArray)
      }
    })
  }

  /**
    * 业务处理
    */
  final def makeEvents(df: DataFrame, uniqKeys: String) = {

    val threadPool: ExecutorService = Executors.newCachedThreadPool

    val eventService = new ExecutorCompletionService[String](threadPool)

    /**if can not get the latest event config, using the cache info*/
    val query_events = Try(dataInterfaceService.getEventsByIFId(taskDiid))
    query_events match {
      case Success(qEvents) => events = qEvents
      case Failure(t) => logError("Failed to get event config for DataBase ")
    }

    val now = new java.util.Date()
    val validEvents = events.filter(event => {

      val period = event.conf.get("period", "")

      if (period.isEmpty) true
      else new EventCycleLife(period, event.conf.id).contains(now)
    })

    validEvents.map(event => eventService.submit(new BuildEvent(event, df, uniqKeys))).foreach(_=>eventService.take.get())

    threadPool.shutdown()
  }

  def withUptime[U](description: String)(fun: => U): U ={
    val start = System.currentTimeMillis
    val result = fun
    val end = System.currentTimeMillis
    println(s"${description}耗时(millis): ${end-start}")
    result
  }
}

class BuildEvent(event: Event, df: DataFrame, uniqKeys: String) extends Callable[String] {
  override def call() = {
    event.buildEvent(df, uniqKeys)
    ""
  }
}

/**
  * Use this singleton to get or register an Accumulator.
  */
object TotalRecordsCounter {

  @volatile private var instance: Accumulator[Long] = null

  def getInstance(sc: SparkContext): Accumulator[Long] = {
    if (instance == null) {
      synchronized {
        if (instance == null) {
          instance = sc.accumulator(0L, "TotalRecordsCounter")
        }
      }
    }
    instance
  }
}

/**
  * Use this singleton to get or register an Accumulator.
  */
object ReservedRecordsCounter {

  @volatile private var instance: Accumulator[Long] = null

  def getInstance(sc: SparkContext): Accumulator[Long] = {
    if (instance == null) {
      synchronized {
        if (instance == null) {
          instance = sc.accumulator(0L, "ReservedRecordsCounter")
        }
      }
    }
    instance
  }
}

