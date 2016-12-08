package com.asiainfo.ocdp.stream.common

import com.asiainfo.ocdp.stream.config.{DataSourceConf, SystemProps}

/**
  * Created by gengwang on 16/12/7.
  */
object BroadcastConf {

   var sysPro:SystemProps =  null
   var dataConf :DataSourceConf =  null

  def initProp(sp: SystemProps, cp: DataSourceConf){
    if ( sp == null || cp == null){
      throw new Exception("sp props is null.")
    }
    if (sysPro == null){
      sysPro = sp
    }
    if (dataConf == null){
      dataConf = cp
    }
  }

}
