package com.asiainfo.ocdp.stream.tools

import java.util.{Properties, Random}

import kafka.producer.{KeyedMessage, Producer, ProducerConfig}

/**
  * Created by xingh1991 on 2016/6/29.
  */
class DataProducer(brokers: String, topic: String) extends Runnable {
  /**
    * 为了简化消息的处理，将消息的格式定义如下：
    * EventID，time，imsi，imei，lac，ci
    */
  private val brokerList = brokers
  private val props = new Properties()
  props.put("metadata.broker.list", this.brokerList)
  props.put("serializer.class", "kafka.serializer.StringEncoder")
  props.put("producer.type", "async")
  private val config = new ProducerConfig(this.props)
  private val producer = new Producer[String, String](this.config)

  private val MSGNUM_MAX = 3
  private val IMSI_MAX = 10
  private val IMEI_MAX = 4
  private val LAC_MAX = 3
  private val CI_MAX = 4
  private val DATA_TYPE = 4

  private val PHONE_MAX = 100

  private val separator = '|'


  def run(): Unit = {
    val rand = new Random()
    var msgId = 1
    var imsi = 1019400
    while (true) {
      val msgNum = rand.nextInt(MSGNUM_MAX)
      try {
        for (i <- 0 to msgNum) {

          //begin time & end time

          val beginTime = System.currentTimeMillis()
          val timeStr = DateFormatUtils.dateMs2Str(beginTime, "yyyyMMddHHmmssSSS")
          val msg = new StringBuilder(timeStr)
          msg.append(separator)
          val endTime = beginTime + 1000 * 60
          val endtimeStr = DateFormatUtils.dateMs2Str(endTime, "yyyyMMddHHmmssSSS")
          msg.append(endtimeStr)
          msg.append(separator)

          // phone number, imsi
          val phoneNum1 = rand.nextInt(PHONE_MAX) + 1000
          val phoneNum2 = rand.nextInt(PHONE_MAX) + 2000
          msg.append("139" + phoneNum1.toString() + phoneNum2.toString)
          msg.append(separator)
          val long_imsi = "460009269" + (imsi + rand.nextInt(IMSI_MAX)).toString

          msg.append(long_imsi)
          msg.append(separator)

          msg.append(rand.nextInt(DATA_TYPE) + 1)
          msg.append(separator)


          // start lac, cell, end lac, cell
          msg.append(rand.nextInt(LAC_MAX) + 31250)
          msg.append(separator)
          msg.append(5125)
          msg.append(separator)
          msg.append(rand.nextInt(LAC_MAX) + 31250)
          msg.append(separator)
          msg.append(5125)
          msg.append(separator)
          msg.append(separator)
          msg.append("0")
          msg.append(separator)
          msg.append("111")
          msg.append(separator)

          val phoneNum3 = rand.nextInt(PHONE_MAX) + 1000
          val phoneNum4 = rand.nextInt(PHONE_MAX) + 2000
          msg.append("137" + phoneNum3.toString() + phoneNum4.toString)
          msg.append(separator)
          msg.append(imsi + 1)
          msg.append(separator)
          msg.append("00000000000")
          msg.append(separator)
          msg.append("1")
          msg.append(separator)
          msg.append("2")

          println(msg.toString())
          //send the generated message to broker
          sendMessage(msg.toString(), long_imsi)
          msgId = msgId + 1
        }
      } catch {
        case e: Exception => println(e)
      }
      try {
        //sleep for 10 seconds after send a micro batch of message
        Thread.sleep(1)
      } catch {
        case e: Exception => println(e)
      }
    }
  }

  def sendMessage(message: String, imsi: String) = {
    try {
      val data = new KeyedMessage[String, String](this.topic, imsi, message);
      producer.send(data);
    } catch {
      case e: Exception => println(e)
    }
  }
}

object DataProducerClient {
  def main(args: Array[String]) {
    if (args.length < 2) {
      println("Usage:DataProducer <metadata.broker.list> <topic>")
      System.exit(1)
    }
    //start the message producer thread
    new Thread(new DataProducer(args(0), args(1))).start()
  }
}