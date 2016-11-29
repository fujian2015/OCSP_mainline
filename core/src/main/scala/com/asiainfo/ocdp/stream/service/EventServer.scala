package com.asiainfo.ocdp.stream.service

import java.util.concurrent.FutureTask
import com.asiainfo.ocdp.stream.common.Logging
import com.asiainfo.ocdp.stream.config.MainFrameConf
import com.asiainfo.ocdp.stream.tools.{CacheFactory, CacheQryThreadPool, InsertEventRows, QryEventCache}
import scala.collection.mutable.Map
import scala.collection.immutable
import java.util.concurrent.ExecutorCompletionService
import scala.collection.mutable.ArrayBuffer

/**
 * Created by surq on 12/09/15.
 */
class EventServer extends Logging with Serializable {

  //保存事件缓存
  def cacheEventData(keyEventIdData: Array[(String, String, String)], cacheFactory :CacheFactory) =
    CacheQryThreadPool.threadPool.execute(new InsertEventRows(keyEventIdData, cacheFactory))

  /**
   * 批量读取指定keys的事件缓存
   * batchList[Array:(eventCache:eventKeyValue,jsonValue)]
   */
  def getEventCache(eventCacheService:ExecutorCompletionService[immutable.Map[String, (String, Array[Byte])]],
      batchList: Array[Array[(String, String)]], eventId: String, interval: Int, cacheFactory :CacheFactory): List[String] = {
    import scala.collection.JavaConversions
    // 满足周期输出的key 和json 。outPutJsonMap :Map[key->json]
    val outPutJsonMap = Map[String, String]()
    batchList.foreach(batch => eventCacheService.submit(new QryEventCache(batch, eventId, cacheFactory)))

    // 遍历各batch线程的结果返回值
    for (index <- 0 until batchList.size) {
      // 把查询的结果集放入multimap
      //result: Map[rowKeyList->Tuple2(jsonList->result)]
      val result = eventCacheService.take.get
      val updateArrayBuffer = new ArrayBuffer[(String, String, String)]()
      if (result != null && result.size > 0) {
        result.foreach(rs => {
          // unkey
          val key = rs._1
          val jsonCache = rs._2
          // json 字段
          val json = jsonCache._1
          // codis 中存储的上次营销时间的二进制
          val cache = jsonCache._2
          // 往次营销时间
          val current_time = System.currentTimeMillis
          if (cache != null) {
            val cache_time = new String(cache)
            // 若cache中有上次营销事件,且满足 营销时间>(上次营销事件+营销周期)
            if (current_time >= (cache_time.toLong + interval * 1000L)) {
              // 放入更新codis list等待更新
              updateArrayBuffer.append((key, eventId, String.valueOf(current_time)))
              // 放入输入map等待输出
              outPutJsonMap += (key -> json)
            }
          }
          else {
            //若cache中没有上次营销时间,则输出事件并将当前时间更新到codis
            val cache_time = "0"
            updateArrayBuffer.append((key, eventId, String.valueOf(current_time)))
            outPutJsonMap += (key -> json)
          }


        })
        // 一个batch的数据完成后，更新codis营销时间
        if (updateArrayBuffer.size > 0) cacheEventData(updateArrayBuffer.toArray, cacheFactory)
      }
    }
    // 返回所有batchLimt的满足营销时间的数据json
    outPutJsonMap.toList.map(_._2)
  }

}
