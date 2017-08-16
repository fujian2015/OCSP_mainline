package com.asiainfo.ocdp.stream.service

import java.text.SimpleDateFormat
import java.util.Date

import com.asiainfo.ocdp.stream.common.{JDBCUtil, Logging}
import com.asiainfo.ocdp.stream.config.{TaskConf, UserSecurityInfo}
import com.asiainfo.ocdp.stream.constant.{DataSourceConstant, ExceptionConstant, TableInfoConstant, TaskConstant}
import org.apache.commons.lang.StringUtils

import scala.util.{Failure, Success, Try}

/**
 * Created by leo on 8/28/15.
 */
class UserSecurityServer extends Logging {

  private def ExecuteQuery(sql: String) {
    try {
      JDBCUtil.execute(sql)
    } catch {
      case e : Throwable => logError("failed to exectue sql:" + sql + " exception: " + e.getStackTrace)
    }
  }

  def getSparkKeytab(name: String): String = {
    val sql = "select spark_keytab from " + TableInfoConstant.UserSecurityTableName + " where name= '" + name +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("spark_keytab").get
  }

  def getSparkPrincipal(name: String): String = {
    val sql = "select spark_principal from " + TableInfoConstant.UserSecurityTableName + " where name= '" + name +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("spark_principal").get
  }

  def getKafkaKeytab(name: String): String = {
    val sql = "select kafka_keytab from " + TableInfoConstant.UserSecurityTableName + " where name= '" + name +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("kafka_keytab").get
  }

  def getKafkaPrincipal(name: String): String = {
    val sql = "select kafka_principal from " + TableInfoConstant.UserSecurityTableName + " where name= '" + name +"'"
    val data = JDBCUtil.query(sql)
    data.head.get("kafka_principal").get
  }

  def getUserSecurityInfo(name: String): UserSecurityInfo = {
    val sql = "select id,spark_principal,spark_keytab,kafka_principal,kafka_keytab,kafka_jaas from " + TableInfoConstant.UserSecurityTableName + " where name= '" + name +"'"
    val data = JDBCUtil.query(sql)
    val userSecurityInfo = new UserSecurityInfo

    if (!data.isEmpty){
      userSecurityInfo.name = StringUtils.trim(name)
      userSecurityInfo.id = StringUtils.trim(data.head.get("id").get)
      userSecurityInfo.sparkPrincipal = StringUtils.trim(data.head.get("spark_principal").get)
      userSecurityInfo.sparkKeytab = StringUtils.trim(data.head.get("spark_keytab").get)
      userSecurityInfo.kafkaPrincipal = StringUtils.trim(data.head.get("kafka_principal").get)
      userSecurityInfo.kafkaKeytab = StringUtils.trim(data.head.get("kafka_keytab").get)
      userSecurityInfo.kafkaJaas = StringUtils.trim(data.head.get("kafka_jaas").get)
    }

    logInfo(s"The current user is ${userSecurityInfo}")

    userSecurityInfo
  }


}
