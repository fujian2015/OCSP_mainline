package com.asiainfo.ocdp.stream.common

import com.asiainfo.ocdp.stream.config.{MainFrameConf, SystemProps, DataSourceConf}
import io.codis.jodis.{JedisResourcePool, RoundRobinJedisPool}
import redis.clients.jedis.JedisPoolConfig

/**
 * Created by leo on 8/12/15.
 */
class JodisCacheManager(sysProps: SystemProps, dsf: DataSourceConf) extends RedisCacheManager(sysProps) {
  override def getResource = jedisPool.getResource

  private val codisProps: DataSourceConf = dsf

  private val jedisPool:JedisResourcePool = {

    val JedisConfig = new JedisPoolConfig()
    JedisConfig.setMaxIdle(codisProps.getInt("jedisMaxIdle"))
    JedisConfig.setMaxTotal(codisProps.getInt("jedisMaxTotal"))
    JedisConfig.setMinEvictableIdleTimeMillis(codisProps.getInt("jedisMEM"))
    JedisConfig.setMinIdle(codisProps.getInt("jedisMinIdle"))
    JedisConfig.setTestOnBorrow(true)

    println("jedisMaxTotal = " + codisProps.getInt("jedisMaxTotal") +
      ", jedisMaxIdle = " + codisProps.getInt("jedisMaxIdle") +
      ", jedisMinIdle = " + codisProps.getInt("jedisMinIdle") +
      ", jedisMEM = " + codisProps.getInt("jedisMEM")
    )

    println("zk = " + codisProps.get("zk") + ", zkSessionTimeoutMs = " + codisProps.getInt("zkSessionTimeoutMs"))

    RoundRobinJedisPool.create().curatorClient(codisProps.get("zk"),
                                               codisProps.getInt("zkSessionTimeoutMs")
                                              ).zkProxyDir(codisProps.get("zkpath"))
                                               .poolConfig(JedisConfig)
                                               .build()
  }

  def closeCacheConnection = {
     jedisPool.close()
  }


}
