package com.asiainfo.ocdp.stream.manager

import com.asiainfo.ocdp.stream.config.TaskConf
import com.asiainfo.ocdp.stream.constant.TaskConstant
import com.asiainfo.ocdp.stream.datasource.DataInterfaceTask

/**
 * Created by leo on 9/16/15.
 */
object StreamTaskFactory {

  def getStreamTask(taskConf: TaskConf): StreamTask = {
    val taskType = taskConf.getTask_type
    if (TaskConstant.TYPE_DATAINTERFACE == taskType)
      new DataInterfaceTask(taskConf)
    //else if (TaskConstant.TYPE_SUTJECT == taskType)
    //  new SubjectTask(id, interval)
    else throw new Exception("Task type " + taskType + " is not supported !")
  }

}
