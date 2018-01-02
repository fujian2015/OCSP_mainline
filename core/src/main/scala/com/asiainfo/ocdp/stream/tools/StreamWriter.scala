package com.asiainfo.ocdp.stream.tools

import java.text.SimpleDateFormat
import java.util.Properties

import com.asiainfo.ocdp.stream.common.{BroadcastManager, ComFunc, Logging}
import com.asiainfo.ocdp.stream.config.{DataInterfaceConf, EventConf, MainFrameConf}
import kafka.producer.KeyedMessage
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
class StreamKafkaWriter(diConf: DataInterfaceConf) extends StreamWriter with Logging {


  // 向kafka发送数据的未尾字段加当前时间
  val dateFormat = "yyyyMMdd HH:mm:ss.SSS"
  val sdf = new SimpleDateFormat(dateFormat)

  def push(rdd: RDD[String], conf: EventConf, uniqKeys: String) = setMessage(rdd, conf, uniqKeys).count

  /**
    * 向kafka发送数据
    */
  def setMessage(jsonRDD: RDD[String], conf: EventConf, uniqKeys: String) = {

    var fildList = conf.select_expr.split(",")
    if (conf.get("ext_fields", null) != null && conf.get("ext_fields") != "") {
      val fields = conf.get("ext_fields").split(",").map(ext => (ext.split("as")) (1).trim)
      fildList = fildList ++ fields
    }
    val delim = conf.delim
    val topic = diConf.get("topic")

    val broadDiconf = BroadcastManager.getBroadDiConf()

    var numPartitions = -1

    val numPartitionsCustom = conf.get("numPartitions", "null")

    if (NumberUtils.isDigits(numPartitionsCustom)) {
      numPartitions = numPartitionsCustom.toInt
    }

    logInfo(s"The number of partitions is $numPartitions")
    //MainFrameConf.flushSystemProps()//重新获取stream_systemprop的配置，事件输出时立即生效
    // 是否追加event_id
    var extraID = MainFrameConf.systemProps.getBoolean(MainFrameConf.EXTRAID, false)

    // 当extraID=true时，设置不追加eventId输出的事件列表
    val no_append_event_ids = MainFrameConf.systemProps.get(MainFrameConf.event_no_append_ids, "")
    logInfo("no_append_event_ids = " + no_append_event_ids + ",this event id=" + conf.id)
    if (no_append_event_ids.split(",").contains(conf.id)) extraID = false

    //在stream_systemprop的配置stream_datainterface的diid，则该输入源下的所有事件均json格式输出
    val jsonFormatEvtDiIds = MainFrameConf.systemProps.get(MainFrameConf.jsonFormat, "")
    val evt_diid = conf.getInIFId
    logInfo(s"json_ids=" + jsonFormatEvtDiIds + ",this evt_DI_id=" + evt_diid)
    val isJsonFormat = if (jsonFormatEvtDiIds.split(",").contains(evt_diid)) true else false
    logInfo(s"isJsonFormat=" + isJsonFormat)

    (if (numPartitions < 0) {
      logInfo("No need to coalesce")
      jsonRDD
    } else {
      logInfo(s"Change partition to ${numPartitions}")
      jsonRDD.coalesce(numPartitions)
    }).mapPartitions(iter => {
      //val diConf = broadDiconf.value
      val diConf = conf.outIFIds(0)
      val messages = ArrayBuffer[KeyedMessage[String, String]]()
      val it = iter.toList.map(jsonstr => {
        val line = Json4sUtils.jsonStr2Map(jsonstr)
        val key = uniqKeys.split(diConf.uniqKeysDelim).map(item => line(item.trim)).mkString(diConf.uniqKeyValuesDelim)

        var msg = ""
        if (isJsonFormat) {
          //1-如果输出json格式的数据
          val outMap = line.+("inst_id" -> conf.id).asInstanceOf[Map[String, String]]
          //line+("process_dt"->sdf.format(System.currentTimeMillis))
          msg = Json4sUtils.map2JsonStr(outMap)
          logDebug(msg)
        } else {
          //2-如果只输出数据
          //val msg_json = line._2
          val msg_head = Json4sUtils.jsonStr2String(jsonstr, fildList, delim)

          // 加入当前msg输出时间戳
          msg = {
            if (extraID)
              conf.id + delim + msg_head // + delim + sdf.format(System.currentTimeMillis)
            else
              msg_head // + delim + sdf.format(System.currentTimeMillis)
          }
        }

        if (key == null) messages.append(new KeyedMessage[String, String](topic, msg))
        else messages.append(new KeyedMessage[String, String](topic, key, msg))
        key
      })
      val msgList = messages.toList
      if (msgList.size > 0) KafkaSendTool.sendMessage(diConf.dsConf, msgList)
      it.iterator
    })
  }

  def push(df: DataFrame, conf: EventConf, uniqKeys: String) = setMessage(ComFunc.Func.DFrametoJsonRDD(df), conf, uniqKeys).count

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