package com.asiainfo.ocdp.stream.common

import com.asiainfo.ocdp.stream.config.{SystemProps, MainFrameConf}
import redis.clients.jedis.{JedisPool, JedisPoolConfig}

/**
 * Created by leo on 8/12/15.
 */
class CodisCacheManager(sysProps: SystemProps) extends RedisCacheManager(sysProps) {
  private val jedisPool: JedisPool = {

    val JedisConfig = new JedisPoolConfig()
	  JedisConfig.setMaxTotal(MainFrameConf.codisProps.getInt("jedisMaxTotal"))
	  JedisConfig.setMaxIdle(MainFrameConf.codisProps.getInt("jedisMaxIdle"))
	  JedisConfig.setMinIdle(MainFrameConf.codisProps.getInt("jedisMinIdle"))
	  JedisConfig.setMinEvictableIdleTimeMillis(MainFrameConf.codisProps.getInt("jedisMEM"))

	  println("jedisMaxTotal = " + MainFrameConf.codisProps.getInt("jedisMaxTotal") +
		  ", jedisMaxIdle = " + MainFrameConf.codisProps.getInt("jedisMaxIdle") +
		  ", jedisMinIdle = " + MainFrameConf.codisProps.getInt("jedisMinIdle") +
		  ", jedisMEM = " + MainFrameConf.codisProps.getInt("jedisMEM")
	  )
    JedisConfig.setTestOnBorrow(true)

    val hp: Tuple2[String, String] = {
      val proxylist = MainFrameConf.codisProps.get("cacheServers").split(",")
       val proxyid  = new java.util.Random().nextInt(proxylist.size)
       val proxyInfo =proxylist(proxyid).split(":")
       val rhost = proxyInfo(0)
       val rip = proxyInfo(1)
      (rhost, rip)
    }
    println("get jedis pool : ip -> " + hp._1 + " ; port -> " + hp._2 +", jedisTimeOut = " + MainFrameConf.codisProps.getInt("jedisTimeOut"))
    new JedisPool(JedisConfig, hp._1, hp._2.toInt, MainFrameConf.codisProps.getInt("jedisTimeOut"))
  }

  override def getResource = jedisPool.getResource

}
