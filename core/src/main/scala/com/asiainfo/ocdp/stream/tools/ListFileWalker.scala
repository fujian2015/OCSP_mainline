package com.asiainfo.ocdp.stream.tools
import java.io.File
import java.util.Collection

import org.apache.commons.io.DirectoryWalker
import org.apache.commons.io.filefilter.IOFileFilter

import scala.collection.JavaConversions._
import scala.collection.mutable.ArrayBuffer

/**
  * Created by peng on 2016/12/5.
  */
class ListFileWalker private (directoryFilter: IOFileFilter, fileFilter: IOFileFilter, depthLimit: Int)
  extends DirectoryWalker[File](directoryFilter: IOFileFilter, fileFilter: IOFileFilter, depthLimit: Int){

  override def handleFile(file: File, depth: Int, results: Collection[File]) = results.add(file)

  def list(startDirectory: File): ArrayBuffer[File] = {
    val files = new ArrayBuffer[File]
    walk(startDirectory, files)
    files
  }
}

object ListFileWalker{
  def apply(directoryFilter: IOFileFilter, fileFilter: IOFileFilter) = new ListFileWalker(directoryFilter, fileFilter, -1)
}
