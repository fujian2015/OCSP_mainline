package com.asiainfo.ocdp.stream.tools

import com.asiainfo.ocdp.stream.common.{BroadcastConf, CacheManager, CodisCacheManager, JodisCacheManager}
import com.asiainfo.ocdp.stream.config.{MainFrameConf, DataSourceConf, SystemProps}

/**
 * Created by tsingfu on 15/8/18.
 */

object CacheFactory {

  val getManager:CacheManager = {

    val sysPro = BroadcastConf.sysPro
    val dataConf = BroadcastConf.dataConf

    if ( sysPro == null || dataConf == null){
      throw new Exception("system props is null.")
    }

    val manager = sysPro.get("cacheManager")

    manager match {
      case "CodisCacheManager" => new CodisCacheManager(sysPro)
      case "JodisCacheManager" => new JodisCacheManager(sysPro, dataConf)
      case _ => throw new Exception("cacheManager is not set!")
    }
  }
}
