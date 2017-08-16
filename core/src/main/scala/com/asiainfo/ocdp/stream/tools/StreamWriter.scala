package com.asiainfo.ocdp.stream.tools

import java.text.SimpleDateFormat
import java.util.Properties

import com.asiainfo.ocdp.stream.common.{BroadcastManager, ComFunc, Logging}
import com.asiainfo.ocdp.stream.config.{DataInterfaceConf, EventConf}
//import kafka.producer.KeyedMessage
import org.apache.kafka.clients.producer.ProducerRecord
import org.apache.commons.lang.math.NumberUtils
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, SaveMode}

import scala.collection.mutable.ArrayBuffer

/**
 * Created by surq on 12/09/15
 */
trait StreamWriter extends Serializable {
  def push(df: DataFrame, conf: EventConf, uniqKeys: String)
  def push(rdd: RDD[String], conf: EventConf, uniqKeys: String)
}

/**
 * Created by surq on 12/09/15
 */
class StreamKafkaWriter(diConf: DataInterfaceConf) extends StreamWriter with Logging{


  def push(rdd: RDD[String], conf: EventConf, uniqKeys: String)= setMessage(rdd, conf, uniqKeys).count
  def push(df: DataFrame, conf: EventConf, uniqKeys: String) = setMessage(ComFunc.Func.DFrametoJsonRDD(df), conf, uniqKeys).count

  // 向kafka发送数据的未尾字段加当前时间
  val dateFormat = "yyyyMMdd HH:mm:ss.SSS"
  val sdf =  new SimpleDateFormat(dateFormat)
  /**
   * 向kafka发送数据
   */
  
  def setMessage(jsonRDD: RDD[String], conf: EventConf, uniqKeys: String) = {

    var fildList = conf.select_expr.split(",")
    if (conf.get("ext_fields", null) != null && conf.get("ext_fields") != "") {
      val fields = conf.get("ext_fields").split(",").map(ext => (ext.split("as"))(1).trim)
      fildList = fildList ++ fields
    }
    val delim = conf.delim
    val topic = diConf.get("topic")

    val broadSysconf = BroadcastManager.getBroadSysProps
    var numPartitions = -1
    val numPartitionsCustom = conf.get("numPartitions", "null")

    if (NumberUtils.isDigits(numPartitionsCustom)){
      numPartitions = numPartitionsCustom.toInt
    }

    val extraID = conf.get(EventConf.EXTRAID, "false").toBoolean
    val timeStamp = conf.get(EventConf.TIMESTAMP, "true").toBoolean

    logInfo(s"ocsp.event.append-id.enable is $extraID")
    logInfo(s"ocsp.event.append-timestamp.enable is $timeStamp")
    logInfo(s"The number of partitions is $numPartitions")
    logInfo(s"Send records to ${conf.outIFIds(0).dsConf} for event ${conf.id}")

    (if (numPartitions < 0){
      jsonRDD
    }else{
      jsonRDD.coalesce(numPartitions)
    }).mapPartitions(iter => {
      val diConf = conf.outIFIds(0)
      val messages = ArrayBuffer[ProducerRecord[String, String]]()
      val it = iter.toList.map(jsonstr =>
        {
          val line = Json4sUtils.jsonStr2Map(jsonstr)
          val key = uniqKeys.split(diConf.uniqKeysDelim).map(item=>line(item.trim)).mkString(diConf.uniqKeyValuesDelim)
          //val msg_json = line._2
          val msg_head = Json4sUtils.jsonStr2String(jsonstr, fildList, delim)
          var msg = { if (extraID) conf.id + delim + msg_head
                    else msg_head }
          // 加入当前msg输出时间戳
          if (timeStamp)
            msg = msg + delim + sdf.format(System.currentTimeMillis)
          if (key == null) messages.append(new ProducerRecord[String, String](topic, msg))
          else messages.append(new ProducerRecord[String, String](topic, key, msg))
          key
        })
      val msgList = messages.toList
      if (msgList.size > 0) KafkaSendTool.sendMessage(diConf.dsConf, msgList,broadSysconf)
      it.iterator
    })
  }

}

class StreamJDBCWriter(diConf: DataInterfaceConf) extends StreamWriter {
  def push(df: DataFrame, conf: EventConf, uniqKeys: String) {
    val dsConf = diConf.dsConf
    val jdbcUrl = dsConf.get("jdbcurl")
    val tableName = diConf.get("tablename")
    val properties = new Properties()
    properties.setProperty("user", dsConf.get("user"))
    properties.setProperty("password", dsConf.get("password"))
    properties.setProperty("rowId", "false")

    df.write.mode(SaveMode.Append).jdbc(jdbcUrl, tableName, properties)
  }

  def push(rdd: RDD[String], conf: EventConf, uniqKeys: String) = {}
}