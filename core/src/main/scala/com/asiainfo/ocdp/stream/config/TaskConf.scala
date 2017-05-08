package com.asiainfo.ocdp.stream.config

import scala.beans.BeanProperty

/**
 * Created by leo on 8/24/15.
 */
class TaskConf() extends BaseConf{
  @BeanProperty var id: String = ""
  @BeanProperty var appID: String = ""
  @BeanProperty var task_type: Int = 0
  @BeanProperty var name: String = ""
  @BeanProperty var receive_interval: Int = 0
  @BeanProperty var num_executors: String = ""
  @BeanProperty var executor_memory: String = ""
  @BeanProperty var driver_memory: String = ""
  @BeanProperty var total_executor_cores: String = ""
  @BeanProperty var queue: String = ""
  @BeanProperty var status: Int = 0
  @BeanProperty var retry: Int = 0
  @BeanProperty var cur_retry: Int = 0
  @BeanProperty var start_time: Long = 0
  @BeanProperty var recovery_mode: String = ""
  @BeanProperty var diid: String = ""
  @BeanProperty var owner: String = ""


  override def toString = s"TaskConf($id, $name, $status)"
}
