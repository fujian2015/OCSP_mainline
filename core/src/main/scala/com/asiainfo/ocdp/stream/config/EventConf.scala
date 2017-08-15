package com.asiainfo.ocdp.stream.config

import scala.beans.BeanProperty

/**
 * Created by tsingfu on 15/8/18.
 */
class EventConf(conf: Map[String, String] = null) extends BaseConf(conf) {
  @BeanProperty var id: String = ""
  @BeanProperty var inIFId: String = ""
  @BeanProperty var outIFIds: Array[DataInterfaceConf] = null
  @BeanProperty var name: String = ""
  @BeanProperty var filte_expr: String = ""
  @BeanProperty var select_expr: String = ""
  @BeanProperty var p_event_id: String = ""
  @BeanProperty var interval: Int = 0
  @BeanProperty var delim: String = ""

  override def toString = s"EventConf($id, $name, $p_event_id)"
}

object EventConf{
  val EXTRAID = "ocsp.event.append-id.enable"
  val TIMESTAMP = "ocsp.event.append-timestamp.enable"
}
