package com.asiainfo.ocdp.stream.config

import scala.beans.BeanProperty

class UserSecurityInfo extends BaseConf{
  @BeanProperty var id: String = ""
  @BeanProperty var name: String = ""
  @BeanProperty var sparkPrincipal: String = ""
  @BeanProperty var sparkKeytab: String = ""
  @BeanProperty var kafkaPrincipal: String = ""
  @BeanProperty var kafkaKeytab: String = ""
  @BeanProperty var kafkaJaas: String = ""

  override def toString = s"UserSecurityInfo($id, $name, $sparkPrincipal, $sparkKeytab, $kafkaPrincipal, $kafkaKeytab, $kafkaJaas)"
}
