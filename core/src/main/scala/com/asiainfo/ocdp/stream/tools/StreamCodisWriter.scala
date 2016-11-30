package com.asiainfo.ocdp.stream.tools

import java.text.SimpleDateFormat

import com.asiainfo.ocdp.stream.common.BroadcastManager
import com.asiainfo.ocdp.stream.config.{DataInterfaceConf, EventConf}
import kafka.producer.KeyedMessage
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{SaveMode, DataFrame}

import scala.collection.mutable
import scala.collection.mutable.ArrayBuffer

/**
  * Created by gengwang on 16/8/18.
  */
class StreamCodisWriter(diConf: DataInterfaceConf) extends StreamWriter{

  def push(rdd: RDD[String], conf: EventConf, uniqKeys: String)= setMessage(rdd, conf, uniqKeys).count
  def push(df: DataFrame, conf: EventConf, uniqKeys: String) = setMessage(df.toJSON, conf, uniqKeys).count


  // 向kafka发送数据的未尾字段加当前时间
  val dateFormat = "yyyyMMdd HH:mm:ss.SSS"
  val sdf =  new SimpleDateFormat(dateFormat)
  /**
    * 向Codis发送数据
    */

  def setMessage(jsonRDD: RDD[String], conf: EventConf, uniqKeys: String) = {

    var fildList = conf.select_expr.split(",")
    if (conf.get("ext_fields", null) != null && conf.get("ext_fields") != "") {
      val fields = conf.get("ext_fields").split(",").map(ext => (ext.split("as"))(1).trim)
      fildList = fildList ++ fields
    }
    val delim = conf.delim

    val resultSiteData:mutable.Map[String,mutable.Map[String,String]] = mutable.Map[String,mutable.Map[String,String]]()

    val broadSysProps = BroadcastManager.getBroadSysProps
    val broadCodisProps = BroadcastManager.getBroadCodisProps

    val resultRDD: RDD[(String, String)] = transforEvent2CodisMessage(jsonRDD, uniqKeys)
    resultRDD.mapPartitions(iter => {

      //Init Task cache
      val cacheFactory = new CacheFactory(broadSysProps.value, broadCodisProps.value)
      val it = iter.toList.map(line =>
      {
        val key = line._1
        val msg_json = line._2

        val msg_arr = Json4sUtils.jsonStr2ArrTuple2(msg_json, fildList)

        val codisMap:mutable.Map[String,String] = mutable.Map[String,String]()
        msg_arr.map(tuple => {
          codisMap += (tuple._1 -> tuple._2)
        })
        resultSiteData += (key -> codisMap)

        key
      })
      //Save cache to Codis
      if (resultSiteData.size > 0) cacheFactory.getManager.hmset(resultSiteData)
      cacheFactory.closeCacheConnection
      it.iterator
    })
  }
  
  /**
    *
    * @param jsonRDD
    * @param uniqKeys
    * @return 返回输出到Codis的(key, message)元组的数组
    */
  def transforEvent2CodisMessage(jsonRDD: RDD[String], uniqKeys: String): RDD[(String, String)] = {

    val prefixKey = diConf.get("codisKeyPrefix")

    jsonRDD.map(jsonstr => {
      val data = Json4sUtils.jsonStr2Map(jsonstr)
      val key = uniqKeys.split(",").map(data(_)).mkString(",")
      (prefixKey + ":" + key, jsonstr)
    })
  }

}
