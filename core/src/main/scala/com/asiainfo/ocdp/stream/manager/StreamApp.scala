package com.asiainfo.ocdp.stream.manager

import com.asiainfo.ocdp.stream.common.{SscManager, Logging}
import com.asiainfo.ocdp.stream.config.MainFrameConf
import com.asiainfo.ocdp.stream.constant.TaskConstant
import com.asiainfo.ocdp.stream.service.TaskServer
import org.apache.spark.streaming.{Seconds, StreamingContext, StreamingContextState}
import org.apache.spark.{SparkConf, SparkContext}
/**
  * Created by leo on 9/16/15.
  */

object StreamApp extends Logging {

  val delaySeconds = MainFrameConf.systemProps.getInt("delaySeconds", 10)
  val periodSeconds = MainFrameConf.systemProps.getInt("periodSeconds", 60)
  val taskServer = new TaskServer

  def main(args: Array[String]) {

    if (args.length < 1) {
      //      System.err.println("usage:  ./bin/spark-class com.asiainfo.ocdc.stream.mainframe [taskId]")
      System.exit(1)
    }

    val taskId = args(0)

    val taskConf = taskServer.getTaskInfoById(taskId)

    //1 初始化 streamingContext


    val sparkConf = new SparkConf().setAppName(taskConf.getName)
    sparkConf.set("spark.scheduler.mode", "FAIR")

    sparkConf.setAppName("OCDP_Streaming")

    val sc = new SparkContext(sparkConf)
    val listener = new AppStatusUpdateListener(taskConf.getId)
    sc.addSparkListener(listener)

    //2 启动 streamingContext
    val ssc = new StreamingContext(sc, Seconds(taskConf.getReceive_interval))
    //    ssc.addStreamingListener(new ReceiveRecordNumListener())
    new TaskStopManager(ssc, taskConf.getId)

    //将ssc存放到sscManager中
    SscManager.initSsc(ssc)

    try {
      StreamTaskFactory.getStreamTask(taskConf).process(ssc)
      ssc.start()
      //4 update task status in db
      if (StreamingContextState.ACTIVE == ssc.getState()) {
        taskServer.startTask(taskConf.getId)
        logInfo("Start task " + taskConf.getId + " sucess !")
      }
      ssc.awaitTermination()
    } catch {
      case e: Exception => {
        e.printStackTrace()
      }
    } finally {
//    ssc.awaitTermination()
      ssc.stop()
      //若task的状态是PRE_RESTART 则将数据库中的task status设为1,准备启动;
      //否则将数据库中task status设为0,停止状态
      if (TaskConstant.PRE_START == taskServer.checkTaskStatus(taskConf.getId) || TaskConstant.PRE_RESTART == taskServer.checkTaskStatus(taskConf.getId)){
      taskServer.RestartTask(taskConf.getId)
        logInfo("Restarting task " + taskConf.getId + " ...")
      }
      else {
        taskServer.stopTask(taskConf.getId)
        logInfo("Stop task " + taskConf.getId + " successfully !")
      }

      sys.exit()
    }


  }

}
