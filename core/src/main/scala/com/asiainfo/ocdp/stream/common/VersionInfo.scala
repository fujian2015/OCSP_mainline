package com.asiainfo.ocdp.stream.common

import java.io.InputStream
import java.util.Properties

/**
  * Created by peng on 2016/12/16.
  */
object VersionInfo extends Logging{
  val info: Properties = {
    val info = new Properties
    val versionInfoFile = "common-version-info.properties"
    var is: InputStream = null
    try {
      is = Thread.currentThread.getContextClassLoader.getResourceAsStream(versionInfoFile)
      if (is == null) {
        logError("Resource not found")
      }else{
        info.load(is)
      }

      info
    }
    finally {
      if(is != null){
        is.close()
      }
    }
  }

  val version = info.getProperty("version", "Unknown")

  val buildDate = info.getProperty("date", "Unknown")

  def main(args: Array[String]): Unit = {
    println("OCSP " + version);
    println("Compiled on " + buildDate);
    sys.exit()
  }

}
