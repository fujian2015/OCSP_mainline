package com.asiainfo.ocdp.stream.common

import org.apache.spark.streaming.StreamingContext

/**
  * Created by gengwang on 16/11/10.
  */
object SscManager {

  private var internalSsc: StreamingContext = null

  def initSsc(ssc: StreamingContext) = {
    internalSsc = ssc
  }

  def getSsc():StreamingContext = {
    internalSsc
  }

}