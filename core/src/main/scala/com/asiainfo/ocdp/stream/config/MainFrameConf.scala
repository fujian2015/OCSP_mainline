package com.asiainfo.ocdp.stream.config

import java.io.InputStream
import java.util.Properties

import com.asiainfo.ocdp.stream.common.JDBCUtil
import com.asiainfo.ocdp.stream.constant.TableInfoConstant
import com.asiainfo.ocdp.stream.tools.Json4sUtils
import org.slf4j.LoggerFactory

/**
 * Created by leo on 8/12/15.
 */

object MainFrameConf {

  val logger = LoggerFactory.getLogger(this.getClass.getSimpleName.replace("$", ""))

  val systemProps = new SystemProps()
  val codisProps = new DataSourceConf()

  val MONITOR_TASK_MONITOR_ENABLE = "ocsp.monitor.task-monitor.enable"
  val KERBEROS_ENABLE = "ocsp.kerberos.enable"
  val KAFKA_KERBEROS_ENABLE = "ocsp.kafka-kerberos.enable"

  initMainFrameConf()

  def initMainFrameConf(): Unit = {
    initSystemProps()
    initCodisProps()

    logger.info("Finish initMainFrameConf")
  }

  /**
   * init SystemProps config
   */
  def initSystemProps() {
    val sql = "select name,value from " + TableInfoConstant.SystemPropTableName
    val sysdata = JDBCUtil.query(sql)
    sysdata.foreach(x => {
      systemProps.set(x.get("name").get, x.get("value").get)
    })
  }

  /**
    * flush SystemProps config
    */
  def flushSystemProps() {
    initSystemProps()
  }

  def initCodisProps() {
    val sql = "select properties " +
      "from " + TableInfoConstant.DataSourceTableName +
      " where type='codis'"

    val datasource = JDBCUtil.query(sql).head

    val propsJsonStr = datasource.get("properties").getOrElse("")
    val propsArrMap = Json4sUtils.jsonStr2ArrMap(propsJsonStr)
    propsArrMap.foreach { kvMap =>
      if (!kvMap.isEmpty) codisProps.set(kvMap.get("pname").get, kvMap.get("pvalue").get)
    }
  }

  val versionInfo: Properties = {
    val info = new Properties
    val versionInfoFile = "common-version-info.properties"
    var is: InputStream = null
    try {
      is = Thread.currentThread.getContextClassLoader.getResourceAsStream(versionInfoFile)
      if (is == null) {
        println("Resource not found")
      }else{
        info.load(is)
      }

      info
    }
    finally {
      if(is != null){
        is.close()
      }
    }
  }
}
