package com.asiainfo.ocdp.stream.tools

import com.asiainfo.ocdp.stream.common.{CacheManager, CodisCacheManager, JodisCacheManager}
import com.asiainfo.ocdp.stream.config.{DataSourceConf, SystemProps, MainFrameConf}

/**
 * Created by tsingfu on 15/8/18.
 */
class CacheFactory(sp: SystemProps, cp: DataSourceConf) {

  private var cacheManager : CacheManager = {
    if ( sp == null || cp == null){
      throw new Exception("system props is null.")
    }
    val manager = sp.get("cacheManager")
    manager match {
      case "CodisCacheManager" => new CodisCacheManager(sp)
      case "JodisCacheManager" => new JodisCacheManager(sp,cp)
      case _ => throw new Exception("cacheManager is not set!")
    }
  }

  def getManager: CacheManager = {
    if (cacheManager == null){
      throw new Exception("cacheManager is not initialized.")
    }
    cacheManager
  }

  // Close cacheManager connections
  def closeCacheConnection = {
    if (cacheManager != null){
      cacheManager.closeCacheConnection()
      cacheManager = null
    }

  }

}
