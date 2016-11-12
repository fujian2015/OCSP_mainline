package com.asiainfo.ocdp.stream.manager

import com.asiainfo.ocdp.stream.common.Logging
import com.asiainfo.ocdp.stream.constant.TaskConstant
import com.asiainfo.ocdp.stream.service.TaskServer
import org.apache.spark.scheduler.{SparkListener, SparkListenerApplicationEnd, SparkListenerApplicationStart}

/**
 * Created by leo on 9/1/15.
 */
class AppStatusUpdateListener(id: String) extends SparkListener with Logging {
  val taskServer = new TaskServer

  override def onApplicationStart(applicationStart: SparkListenerApplicationStart) {
    taskServer.startTask(id)
    logInfo("Start task " + id + " successfully !")
  }

  override def onApplicationEnd(applicationEnd: SparkListenerApplicationEnd) {
    //若task的状态是PRE_RESTART 则将数据库中的task status设为1,准备启动;
    //否则将数据库中task status设为0,停止状态
    if (TaskConstant.PRE_RESTART == taskServer.checkTaskStatus(id)){
      taskServer.RestartTask(id)
      logInfo("Restart task " + id + " successfully !")
    }
    else {
      taskServer.stopTask(id)
      logInfo("Stop task " + id + " successfully !")
    }

  }

}
