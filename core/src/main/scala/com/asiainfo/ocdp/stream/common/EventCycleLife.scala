package com.asiainfo.ocdp.stream.common

import java.text.SimpleDateFormat

import scala.util.parsing.json.JSON
import java.util.{Calendar, Date}

import org.apache.commons.lang.StringUtils
import org.apache.commons.lang.time.DateFormatUtils


/**
  * Created by yangjie9 on 2017/2/6.
  */
//TODO need event id
class EventCycleLife(jsonStr: String, eventId: String) extends Logging{
  val cycleLife = JSON.parseFull(jsonStr)
  val cycleLifeMap = cycleLife.get.asInstanceOf[Map[String,Any]]


  val period = cycleLifeMap.getOrElse("period", "").asInstanceOf[String]


  val times: List[Period] = {
    var _times: List[Period] = List()
    val time = cycleLifeMap.get("time").get.asInstanceOf[List[Map[String,Any]]]

    time.map(p => _times=(new Period(p)) :: _times)
    _times
  }

  val dateFormat = "yyyy-MM-dd"
  val dm = new SimpleDateFormat(dateFormat)
  val hm = new SimpleDateFormat("HH:mm:ss")

  def contains(now: Date): Boolean = {
    val startDate = cycleLifeMap.getOrElse("startDate", "").asInstanceOf[String]
    val endDate = cycleLifeMap.getOrElse("endDate", "").asInstanceOf[String]

    if (StringUtils.isNotEmpty(startDate) && StringUtils.isNotEmpty(endDate)){
      val _startDate = dm.parse(startDate)
      val _endDate = dm.parse(endDate)

      val currentDate = DateFormatUtils.format(Calendar.getInstance(), dateFormat)
      val _currentDate = dm.parse(currentDate)

      logInfo(s"The current period of event ${eventId} is ${period}")
      if (_startDate.compareTo(_currentDate) <= 0 && _endDate.compareTo(_currentDate) >= 0){
        if (StringUtils.isNotEmpty(period) && !StringUtils.equalsIgnoreCase(period, "always")){
          val nowTime = getTime(now)
          logInfo(s"period times are ${times} and now is ${nowTime}")
          times.foreach(p => if(p.contains(nowTime)) return true)
          logInfo(s"Event ${eventId} is not available since ${times}")
          false
        }else{
          logInfo(s"Event ${eventId} is available since startDate is ${startDate} and endDate is ${endDate}")
          true
        }
      }
      else{
        logInfo(s"Event ${eventId} is not available since startDate is ${startDate} and endDate is ${endDate}")
        false
      }
    }
    else{
      logInfo(s"Either startDate='${startDate}' or endDate='${endDate}' is not available for event ${eventId}.")
      if (StringUtils.isNotEmpty(period) && !StringUtils.equalsIgnoreCase(period, "always")){
        val nowTime = getTime(now)
        times.foreach(p => if(p.contains(nowTime)) return true)

        false
      }else{
        logInfo(s"Event ${eventId} is available")
        true
      }
    }

  }

  def getTime(date: Date):Time = {

    var nowMap = Map("h" -> hm.format(date))

    val calendar = Calendar.getInstance();

    calendar.setTime(date);

    period match {
      case "none" =>
        nowMap +=  ("d" -> dm.format(date))
      case "day"  =>
        nowMap +=  ("d" -> "0")
      case "week" =>
        nowMap +=  ("d" -> calendar.get(Calendar.DAY_OF_WEEK).toString)
      case "month" => {
        val d = calendar.get(Calendar.DAY_OF_MONTH)
        var day = d.toString
        if(d<10) day= "0" + day
        nowMap += ("d" -> day)
      }
    }
    new Time(nowMap)
  }
}
class Period(p:Map[String,Any]){

  val begin = new Time(p.get("begin").get.asInstanceOf[Map[String,Any]])

  val end = new Time(p.get("end").get.asInstanceOf[Map[String,Any]])

  def contains(n:Time): Boolean ={begin <= n && end >= n}

  override def toString = s"Period(begin:$begin, end:$end)"
}

class Time(t:Map[String,Any]) {

  val day =  t.get("d").get.asInstanceOf[String]
  val hour = t.get("h").get.asInstanceOf[String]

  def > (t:Time): Boolean ={

    val d = day.compareTo(t.day)

    if(d>0||(d==0&&hour.compareTo(t.hour)>0))
      return true

    false
  }
  def < (t:Time): Boolean ={

    val d = day.compareTo(t.day)

    d<0||(d==0&&hour.compareTo(t.hour)<0)
  }

  def == (t:Time): Boolean ={day.compareTo(t.day)==0&&hour.compareTo(t.hour)==0}

  def <= (t:Time): Boolean ={this==t || this < t}

  def >= (t:Time): Boolean ={this==t || this > t}

  override def toString = s"Time(day:$day, hour:$hour)"
}

