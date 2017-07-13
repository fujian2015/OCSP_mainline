package com.asiainfo.ocdp.stream.event

import com.asiainfo.ocdp.stream.common.{BroadcastConf, BroadcastManager, ComFunc, Logging}
import com.asiainfo.ocdp.stream.config.{EventConf, MainFrameConf}
import com.asiainfo.ocdp.stream.constant.EventConstant
import com.asiainfo.ocdp.stream.service.EventServer
import com.asiainfo.ocdp.stream.tools.{Json4sUtils, StreamWriterFactory}
import org.apache.commons.lang.StringUtils
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{AnalysisException, DataFrame}

import scala.collection.mutable.ArrayBuffer

/**
 * Created by surq on 12/09/15
 */
class Event extends Serializable with Logging{

  var conf: EventConf = null

  val eventServer = new EventServer()
  val batchLimit = MainFrameConf.systemProps.getInt("cacheQryBatchSizeLimit")

  var receive_interval = 0

  def init(eventconf: EventConf) {
    conf = eventconf
  }

  def buildEvent(df: DataFrame, uniqKeys: String) = {
    // 用户配置的本业务输出字段
    var mix_sel_expr = conf.select_expr.split(",")

    // 向输出字段中追加用字户定义字段，如固定字段“1”，“xxx”
    if (conf.get("ext_fields", null) != null)
      mix_sel_expr = mix_sel_expr ++ conf.get("ext_fields", null).split(",")

    val filter_expr = conf.filte_expr

    try {
      // 根据业务条件过滤，并查询出输出字段
      val eventDF = if(StringUtils.isEmpty(filter_expr))df.selectExpr(mix_sel_expr: _*) else df.filter(conf.filte_expr).selectExpr(mix_sel_expr: _*)

      // 事件复用的时候会用到，注意做eventDF.persist
      // if (EventConstant.NEEDCACHE == conf.getInt("needcache", 0)) cacheEvent(eventDF, uniqKeys)
      // 如果业务输出周期不为0，那么需要从codis中取出比兑营销时间，满足条件的输出
      val jsonRDD = if (EventConstant.RealtimeTransmission != conf.interval) checkEvent(eventDF, uniqKeys)
      //else eventDF.toJSON
      else ComFunc.Func.DFrametoJsonRDD(eventDF)
      outputEvent(jsonRDD, uniqKeys)
    } catch {
      case e: AnalysisException => {
        logInfo(s"mix_sel_expr is ${mix_sel_expr.toList}")
        logInfo(s"The current schema is ${df.schema.toList}")
        logError(s"Make event [${conf.getId}] failed", e)
      }
    }

  }

  /**
   * 过滤营销周期不满足的数据，输出需要营销的数据，并更新codis营销时间
   */
  import java.util.concurrent.ExecutorCompletionService

  import com.asiainfo.ocdp.stream.tools.CacheQryThreadPool

  import scala.collection.immutable
  def checkEvent(eventDF: DataFrame, uniqKeys: String): (RDD[String]) = {
    val time_EventId = EventConstant.EVENTCACHE_FIELD_TIMEEVENTID_PREFIX_KEY + conf.id

    BroadcastManager.broadcastEventConf(conf)
    val broadEventConf = BroadcastManager.getBroadEventConf

    val broadSysProps = BroadcastManager.getBroadSysProps
    val broadCodisProps = BroadcastManager.getBroadCodisProps
    val broadTaskConf = BroadcastManager.getBroadTaskConf

    ComFunc.Func.DFrametoJsonMapPartitions(eventDF)(iter => {
      val conf = broadEventConf.value
      //Init Broadcast conf
      BroadcastConf.initProp(broadSysProps.value, broadCodisProps.value)

      val eventCacheService = new ExecutorCompletionService[immutable.Map[String, (String, Array[Byte])]](CacheQryThreadPool.threadPool)
      val batchList = new ArrayBuffer[Array[(String, String)]]()

      var batchArrayBuffer: ArrayBuffer[(String, String)] = null
      val jsonList = iter.toList
      val size = jsonList.size
      // 把json按指定的与codis库查询条数（batchLimit），分块更新
      for (index <- 0 until size) {
        if (index % batchLimit == 0) {
          // 把list放入线程池更新codis
          if (index != 0) batchList += batchArrayBuffer.toArray
          batchArrayBuffer = new ArrayBuffer[(String, String)]()
        }
        // 解析json数据，拼凑eventKey
        val line = jsonList(index)
        val current = Json4sUtils.jsonStr2Map(line)

        broadEventConf.value.outIFIds.foreach(diConf =>{
          val eventUniqKeys = diConf.get("uniqKeys")
          var eventKeyValue = ""
          if (StringUtils.isEmpty((eventUniqKeys))){
            eventKeyValue = uniqKeys.split(diConf.uniqKeysDelim).map(item=>current(item.trim)).mkString(diConf.uniqKeyValuesDelim)
          }
          else{
            eventKeyValue = eventUniqKeys.split(diConf.uniqKeysDelim).map(item=>current(item.trim)).mkString(diConf.uniqKeyValuesDelim)
          }

          batchArrayBuffer += ((s"${EventConstant.EVENT_CACHE_PREFIX_NAME}_${broadTaskConf.value.id}:${eventKeyValue}", line))
        })

        // 把list放入线程池更新codis
        if (index == size - 1) batchList += batchArrayBuffer.toArray
      }

      val outPutJsonList = {
        if(conf.getInterval == receive_interval){
          logInfo("Start to distinct...")
          eventServer.distinct(batchList.toArray)
        }else{
          logInfo(s"Start to update cache since [${conf.getInterval} != ${receive_interval}]...")
          eventServer.getEventCache(eventCacheService, batchList.toArray, time_EventId, conf.getInterval)
        }

      }

      outPutJsonList.iterator
    })
  }

  /**
   * rdd格式流输出
   */
  def outputEvent(rdd: RDD[String], inputResourceUniqKeys: String) = {
    conf.outIFIds.map(ifconf => {
      val writer = StreamWriterFactory.getWriter(ifconf)
      val eventUniqKeys = ifconf.get("uniqKeys")
      if (StringUtils.isEmpty(eventUniqKeys)){
        writer.push(rdd, conf, inputResourceUniqKeys)
      }
      else{
        writer.push(rdd, conf, eventUniqKeys)
      }

    })
  }

  override def toString = s"Event($conf)"
}
