package com.asiainfo.ocdp.stream.tools

import com.asiainfo.ocdp.stream.common.{CacheManager, CodisCacheManager, JodisCacheManager}
import com.asiainfo.ocdp.stream.config.{DataSourceConf, SystemProps, MainFrameConf}

/**
 * Created by tsingfu on 15/8/18.
 */
object CacheFactory {

  @volatile private var systemProps : SystemProps = null
  @volatile private var codisProps : DataSourceConf = null
  @volatile private var cacheManager : CacheManager = null

  private def setCacheProps(sp: SystemProps, cp: DataSourceConf) = {
      systemProps = sp
      codisProps = cp
  }

  def initCache(sp: SystemProps, cp: DataSourceConf) = {
    //Set system props and codis props
    setCacheProps(sp, cp)

    if (cacheManager == null){
      val manager = systemProps.get("cacheManager")
      manager match {
        case "CodisCacheManager" => cacheManager = new CodisCacheManager(systemProps)
        case "JodisCacheManager" => cacheManager = new JodisCacheManager(systemProps,codisProps)
        case _ => throw new Exception("cacheManager is not set!")
      }
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
