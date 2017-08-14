package com.asiainfo.ocdp.stream.tools

import org.apache.spark.streaming.kafka010.{OffsetRange => OffsetRange010}
import org.slf4j.LoggerFactory

/**
  * Created by rainday on 8/14/17.
  * debug kafka offset info
  */
object OffsetStatistics {

  val logger = LoggerFactory.getLogger(this.getClass)

  def getSatisticsInfo(offsetArray: scala.Array[org.apache.spark.streaming.kafka010.OffsetRange]) = {

    if (offsetArray.length > 0) {

      var minOffset : OffsetRange010 = null
      var maxOffset : OffsetRange010 = null

      var minOff = 1000000L;
      var maxOff = 0L;
      var total = 0L;

      for (o <- offsetArray) {
        logger.debug(s"reading offset: ${o.topic} ${o.partition} ${o.fromOffset} ${o.untilOffset} ")
        if (o.untilOffset >= o.fromOffset) {
          val size = o.untilOffset - o.fromOffset
          if (size <= minOff) {
            minOff = size
            minOffset = o
          }
          if (size >= maxOff) {
            maxOff = size
            maxOffset = o
          }
          total = total + size
        }
      }

      logger.info(s"min offset: ${minOffset.topic} partition num: ${minOffset.partition} offset from : ${minOffset.fromOffset} offset end: ${minOffset.untilOffset} size: ${minOff}")
      logger.info(s"max offset: ${maxOffset.topic} partition num: ${maxOffset.partition} offset from : ${maxOffset.fromOffset} offset end: ${maxOffset.untilOffset} size: ${maxOff}")

      val avg = if (offsetArray.length > 2) {
        total = total - minOff - maxOff
        total / (offsetArray.length - 2)
      } else (total / offsetArray.length)

      logger.info(s"average size: ${avg}  partition count: " + offsetArray.length)
    }

  }
}
