package com.asiainfo.ocdp.stream.service

import com.asiainfo.ocdp.stream.common.{JDBCUtil, Logging}
import com.asiainfo.ocdp.stream.config.TaskConf
import com.asiainfo.ocdp.stream.constant.{DataSourceConstant, ExceptionConstant, TableInfoConstant, TaskConstant}
import org.apache.commons.lang.StringUtils
import java.text.SimpleDateFormat
import java.util.Date

import scala.tools.scalap.scalax.util.StringUtil
import scala.util.{Failure, Success, Try}

/**
 * Created by leo on 8/28/15.
 */
class TaskServer extends Logging {

  private def ExecuteQuery(sql: String) {
    try {
      JDBCUtil.execute(sql)
    } catch {
      case e : Throwable => logError("failed to exectue sql:" + sql + " exception: " + e.getStackTrace)
    }
  }

  def startTask(id: String, appID: String) {
    updateHeartbeat(id)
    val startTime = System.currentTimeMillis()
    val sql = s"update ${TableInfoConstant.TaskTableName} set appID='${appID}', status=${TaskConstant.RUNNING}, start_time='${startTime}' where id= '${id}'"
    //JDBCUtil.execute(sql)
    ExecuteQuery(sql)
  }

  def RestartTask(id: String) {
    val sql = "update " + TableInfoConstant.TaskTableName + " set status=" + TaskConstant.PRE_START + " where id= '" + id +"'"
    //JDBCUtil.execute(sql)
    ExecuteQuery(sql)
  }

  def RetryTask(id: String) {
    val sql = "update " + TableInfoConstant.TaskTableName + " set status=" + TaskConstant.RETRY+ " where id= '" + id +"'"
    //JDBCUtil.execute(sql)
    ExecuteQuery(sql)
  }

  def stopTask(id: String) {
    val stopTime = System.currentTimeMillis()
    val sql = s"update ${TableInfoConstant.TaskTableName}  set status=${TaskConstant.STOP}, stop_time='${stopTime}', cur_retry=0 where id='${id}'"
    //JDBCUtil.execute(sql)
    ExecuteQuery(sql)
  }

  def checkTaskStatus(id: String): Int = {
    val sql = "select status from " + TableInfoConstant.TaskTableName + " where id= '" + id +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("status").get.toInt
  }

  /*
  def getStartTime(id: String): Long = {
    val sql = "select start_time from " + TableInfoConstant.TaskTableName + " where id= '" + id +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("start_time").get.toLong
  }*/

  def updateRetry(id: String, retry: Int) {
    val sql = "update " + TableInfoConstant.TaskTableName + " set cur_retry=" + retry + " where id= '" + id +"'"
    //JDBCUtil.execute(sql)
    ExecuteQuery(sql)
  }

  def updateHeartbeat(id: String): Unit = {
    val curTime = System.currentTimeMillis()
    val sql = s"update ${TableInfoConstant.TaskTableName} set heartbeat='${curTime}' where id= '${id}'"
    //JDBCUtil.execute(sql)
    ExecuteQuery(sql)
  }

  def getHeartbeat(id: String): Long = {
    val sql = "select heartbeat from " + TableInfoConstant.TaskTableName + " where id= '" + id +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("heartbeat").get.toLong
  }

  def insertExcepiton(id: String, appID: String, exceptionType: Int, exceptionInfo: String) = {
      /**
        * --------------------------------------------------------------------------------------------
        * exceptionID | taskID | appID | exception_type | exception_info | level | begin_time | end_time
        * --------------------------------------------------------------------------------------------
        */
    val date=new SimpleDateFormat("yyyy-MM-dd H:mm:ss")
    val curTime = date.format(new Date())
    val sql =  s"insert into ${TableInfoConstant.ExceptionTableName} (taskID,appID,exception_type,exception_info,level,begin_time,end_time) " +
        s"VALUES ('${id}','${appID}',${exceptionType}, '${exceptionInfo}', ${ExceptionConstant.EXCEPTION_ERROR}, '${curTime}', '${curTime}');"
    //JDBCUtil.execute(sql)
    ExecuteQuery(sql)
  }

  def updateException(id: String, appID: String, exceptionType: Int, exceptionInfo: String): Unit = {
    //query the exception before
    val q =  s"select id,appID,exception_type,exception_info from ${TableInfoConstant.ExceptionTableName} " +
      s"where taskID= '${id}' and appID= '${appID}' and exception_type= ${exceptionType} " +
      s"order by begin_time desc limit 1"

    val res = Try(JDBCUtil.query(q))
    res match {
      case Success(data) => {
        if (!data.isEmpty) {
          /**for update exception end_time*/
          val date=new SimpleDateFormat("yyyy-MM-dd H:mm:ss")
          val curTime = date.format(new Date())
          val exception_id = data.head.get("id").get
          val sql = s"update ${TableInfoConstant.ExceptionTableName} set level=${ExceptionConstant.EXCEPTION_ERROR}, end_time='${curTime}' where id= '${exception_id}' "
          //JDBCUtil.execute(sql)
          ExecuteQuery(sql)
        } else {
          insertExcepiton(id, appID, exceptionType, exceptionInfo)
        }
      }
      case Failure(e) => {
        logError("fail to update Exception info into db " + e.getStackTrace)
      }
    }
  }

  def checkMaxRetry(id: String): Int = {
    val sql = "select retry from " + TableInfoConstant.TaskTableName + " where id= '" + id +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("retry").get.toInt
  }

  /*
  def checkTaskRetry(id: String): Int = {
    val sql = "select cur_retry from " + TableInfoConstant.TaskTableName + " where id= '" + id +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("cur_retry").get.toInt
  }*/

  private def getNumeric(x: Map[String, String], key: String, default: String): String = {
    val v = x.getOrElse(key, default)
    if (v == null) {
      default
    } else {
      v
    }
  }
  def getAllTaskInfos(): Array[TaskConf] = {

    val sql = "select id,appID,type,receive_interval,status,num_executors,executor_memory,driver_memory,executor_cores,queue,retry,cur_retry,start_time,diid,owner from " + TableInfoConstant.TaskTableName
    val res = Try(JDBCUtil.query(sql))
    res match {
      case Success(data) => {
        data.map(x => {
          val taskConf = new TaskConf()
          taskConf.setId(x.get("id").get)
          taskConf.setAppID(x.get("appID").get)
          taskConf.setTask_type(x.get("type").get.toInt)
          taskConf.setStatus(x.get("status").get.toInt)
          taskConf.setNum_executors(x.get("num_executors").get)
          taskConf.setExecutor_memory(x.get("executor_memory").get)
          taskConf.setDriver_memory(x.get("driver_memory").get)
          taskConf.setExecutor_cores(x.get("executor_cores").get)
          taskConf.setQueue(x.get("queue").get)
          taskConf.setRetry(getNumeric(x,"retry","0").toInt)
          taskConf.setDiid(x.get("diid").get)
          taskConf.setOwner(x.getOrElse("owner", ""))
          taskConf.setCur_retry(x.get("cur_retry").get.toInt)
          taskConf.setStart_time(getNumeric(x,"start_time","0").toLong)
          taskConf.setReceive_interval(x.get("receive_interval").get.toInt)
          taskConf
        })
      }
      case Failure(e) => {
        new Array[TaskConf](0)
      }
    }
  }

  def getTaskInfoById(id: String): TaskConf = {
    val sql = "select id,appID,type,name,receive_interval,retry,diid, owner, recover_mode from " + TableInfoConstant.TaskTableName + " where id= '" + id +"'"
    val data = JDBCUtil.query(sql).head
    val taskConf = new TaskConf()
    taskConf.setId(data.get("id").get)
    taskConf.setAppID(data.get("appID").get)
    taskConf.setTask_type(data.get("type").get.toInt)
    taskConf.setName(data.get("name").get)
    taskConf.setReceive_interval(data.get("receive_interval").get.toInt)
    taskConf.setRetry(getNumeric(data,"retry","0").toInt)
    taskConf.setDiid(data.get("diid").get)
    taskConf.setOwner(data.getOrElse("owner", ""))
    taskConf.setRecovery_mode(getNumeric(data,"recover_mode", DataSourceConstant.FROM_LATEST))
    taskConf
  }

}
