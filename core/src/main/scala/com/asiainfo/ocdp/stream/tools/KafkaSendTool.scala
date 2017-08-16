package com.asiainfo.ocdp.stream.tools

import java.util.Properties

import com.asiainfo.ocdp.stream.common.BroadcastManager
import com.asiainfo.ocdp.stream.config.{DataSourceConf, MainFrameConf, SystemProps}
//import kafka.producer.{ KeyedMessage, ProducerConfig, Producer }
import org.apache.kafka.clients.producer.{KafkaProducer, Producer, ProducerConfig, ProducerRecord}
import scala.collection.mutable
import org.apache.spark.broadcast.Broadcast

/**
 * Created by tsingfu on 15/8/18.
 */

// -------update by surq start 2015.12.14 ---------------------------------

object KafkaSendTool {

 // val DEFAULT_METADATA_BROKER_LIST = MainFrameConf.systemProps.get("metadata.broker.list", "")
  //val DEFAULT_SERIALIZER_CLASS = MainFrameConf.systemProps.get("serializer.class", "kafka.serializer.StringEncoder")

  val DEFAULT_SERIALIZER_CLASS = "kafka.serializer.StringEncoder"

  // surq:一个datasource 对应一个producer，跟业务个数无直接关系
  val dsid2ProducerMap = mutable.Map[String, KafkaProducer[String, String]]()

  // 多线程、多producer,分包发送
  //  def sendMessage(dsConf: DataSourceConf, message: List[KeyedMessage[String, String]]) =
  //    message.sliding(200, 200).foreach(list => CacheQryThreadPool.threadPool.execute(new Runnable {
  //      override def run() = getProducer(dsConf).send(list: _*)
  //    }))

  def sendMessage(dsConf: DataSourceConf, message: List[ProducerRecord[String, String]],broadSysConf: Broadcast[SystemProps]) = {
    val msgList: Iterator[List[ProducerRecord[String, String]]] = message.sliding(200, 200)
    if (msgList.size > 0){
    	val producer: KafkaProducer[String, String] = getProducer(dsConf, broadSysConf)
    	message.sliding(200, 200).foreach((list: List[ProducerRecord[String, String]]) => {
        list.foreach((record: ProducerRecord[String, String]) => {
          producer.send(record)
        })
    })
    }
  }

  // 对应的producer若不存在，则创建新的producer，并存入dsid2ProducerMap
  private def getProducer(dsConf: DataSourceConf, broadSysConf: Broadcast[SystemProps]): KafkaProducer[String, String] =
    dsid2ProducerMap.getOrElseUpdate(dsConf.dsid, {
    val kerberos_enable = broadSysConf.value.getBoolean("ocsp.kerberos.enable", false)
    val kafka_kerberos_enable = if (kerberos_enable) broadSysConf.value.getBoolean("ocsp.kafka-kerberos.enable", true)
                                else false
      val props = new Properties()
      props.put("bootstrap.servers", dsConf.get("metadata.broker.list", ""))
      props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer")
      props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer")
      if (kafka_kerberos_enable) {
        props.put("security.protocol","SASL_PLAINTEXT")
      }
      //props.put("serializer.class", dsConf.get("serializer.class", DEFAULT_SERIALIZER_CLASS))
      new KafkaProducer[String, String](props)
    })

}