package com.asiainfo.ocdp.stream.datasource

import com.asiainfo.ocdp.stream.common.{KafkaCluster, Logging}
import com.asiainfo.ocdp.stream.config.DataInterfaceConf
import com.asiainfo.ocdp.stream.constant.DataSourceConstant
import org.apache.spark.rdd.RDD
import org.apache.spark.streaming.StreamingContext
import org.apache.spark.streaming.kafka.HasOffsetRanges

import scala.reflect.ClassTag

/**
  * Created by rainday on 2/15/17.
  */

object StreamingSourceFactory extends Logging {

  def createDataSource(ssc: StreamingContext, conf: DataInterfaceConf) : StreamingSource = {
    conf.getDsConf.getDsType match  {
      case "kafka" => new KafkaReader(ssc, conf)
      case "hdfs" => new HdfsReader(ssc, conf)
      case _ =>
        throw new Exception("EventSourceType " + conf.dsConf.getDsType + " is not support !")
    }
  }

  def updateDataSource[R: ClassTag](conf: DataInterfaceConf, rdd: RDD[R]) : Boolean = {
    conf.getDsConf.getDsType match  {
      case "kafka" => updateKafkaSource(conf, rdd)
      case "hdfs" => true
      case _ =>
        throw new Exception("EventSourceType " + conf.dsConf.getDsType + " is not support !")
    }
  }

  private def updateKafkaSource[R: ClassTag](conf: DataInterfaceConf, rdd: RDD[R]) : Boolean = {

    val offsetList = rdd.asInstanceOf[HasOffsetRanges].offsetRanges

    val dsConf = conf.getDsConf
    val kafkaParams = Map[String, String](DataSourceConstant.BROKER_LIST_KEY -> dsConf.get(DataSourceConstant.BROKER_LIST_KEY))
    val groupId = dsConf.get(DataSourceConstant.GROUP_ID_KEY)
    val kc = new KafkaCluster(kafkaParams)

    val offsetMap = offsetList.map(offset => (offset.topicAndPartition() -> offset.untilOffset)) toMap
    val o = kc.setConsumerOffsets(groupId, offsetMap)

    if (o.isLeft) {
      logError(s"Error updating the offset to Kafka cluster: ${o.left.get}")
      return false
    }

    logInfo(s"update offset into zk group : ${groupId}")
    for (offset <- offsetList) {
      logDebug(s"update offsets, topic: ${offset.topic}, partition: ${offset.partition}, offset: ${offset.untilOffset}")
    }
    return true
  }

}

