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
  val EXTRAID = "ocsp.event.append-id.enable"
  val jsonFormat="ocsp.event.output.record.json_format.ids"
  // 当ocsp.event.append-id.enable=true时，设置不追加eventId的事件列表
  val event_no_append_ids = "ocsp.event.output.record.no_append.ids"

  initMainFrameConf()

  def initMainFrameConf(): Unit = {
    initSystemProps()
    initCodisProps()

    println("= = " * 20 +" finish initMainFrameConf")
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
