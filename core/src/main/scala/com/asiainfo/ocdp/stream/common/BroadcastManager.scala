package com.asiainfo.ocdp.stream.common

import com.asiainfo.ocdp.stream.config.{EventConf, DataSourceConf, SystemProps, DataInterfaceConf}
import com.asiainfo.ocdp.stream.event.Event
import com.asiainfo.ocdp.stream.label.Label
import org.apache.spark.broadcast.Broadcast

/**
  * Created by gengwang on 16/11/10.
  */
object BroadcastManager {

  //Start: Define the variable to broadcast from driver here.
  @volatile private var broadDiConf: Broadcast[DataInterfaceConf] = null
  @volatile private var broadLabels: Broadcast[Array[Label]] = null
  @volatile private var broadSystemProps : Broadcast[SystemProps] = null
  @volatile private var broadCodisProps : Broadcast[DataSourceConf] = null
  @volatile private var broadEventConf : Broadcast[EventConf] = null

  //End: Define the variable to broadcast from driver here.

  //Start: Define functions to broadcast and get broadcast variables.
  def broadcastDiConf(diConf: DataInterfaceConf) = {
    if (broadDiConf == null) {
      broadDiConf = SscManager.getSsc().sparkContext.broadcast(diConf)
    }
  }

  def getBroadDiConf():Broadcast[DataInterfaceConf]={
    if (broadDiConf == null){
      throw new NullPointerException("null broad cast Di Conf")
    }
    broadDiConf
  }

  def broadcastLabels(labels: Array[Label]) = {
    if (broadLabels == null) {
      broadLabels = SscManager.getSsc().sparkContext.broadcast(labels)
    }
  }

  def getBroadLabels: Broadcast[Array[Label]] = {
    if (broadLabels == null){
      throw new NullPointerException("null broad cast labels")
    }
    broadLabels
  }

  def broadcastSystemProps(sysProps: SystemProps) = {
    if (broadSystemProps == null) {
      broadSystemProps = SscManager.getSsc().sparkContext.broadcast(sysProps)
    }
  }

  def getBroadSysProps: Broadcast[SystemProps] = {
    if (broadSystemProps == null){
      throw new NullPointerException("null broad cast system props")
    }
    broadSystemProps
  }

  def broadcastCodisProps(codisProps: DataSourceConf) = {
    if (broadCodisProps == null) {
      broadCodisProps = SscManager.getSsc().sparkContext.broadcast(codisProps)
    }
  }

  def getBroadCodisProps : Broadcast[DataSourceConf] = {
    if (broadCodisProps == null){
      throw new NullPointerException("null broad cast codis props")
    }
    broadCodisProps
  }

  def broadcastEventConf(eventConf : EventConf) = {
    if (broadEventConf == null) {
      broadEventConf = SscManager.getSsc().sparkContext.broadcast(eventConf)
    }
  }

  def getBroadEventConf : Broadcast[EventConf] = {
    if (broadEventConf == null){
      throw new NullPointerException("null broad cast event conf")
    }
    broadEventConf
  }

  //End: Define functions to broadcast and get broadcast variables.


}
