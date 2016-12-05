#!/bin/bash

echo "------start the server!------"

FWDIR=$(cd `dirname $0`/..; pwd)

JAVA_OPTS="-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:$FWDIR/logs/gc.log -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=$FWDIR/logs/"

SPARK_HOME=

SPARK_ASSEMBLY_JAR=`ls $SPARK_HOME/lib/*spark-assembly*jar`
for jarFile in `ls $FWDIR/lib/*jar`
do
  CLASSPATH=$CLASSPATH:$jarFile
done

CLASSPATH=$CLASSPATH:$SPARK_ASSEMBLY_JAR

nohup java -cp $CLASSPATH com.asiainfo.ocdp.stream.manager.MainFrameManager &>> $FWDIR/logs/MainFrameManager.log&

sleep 1

proc_name="MainFrameManager"
name_suffixx="\>"
mpid=`ps -ef|grep -i ${proc_name}${name_suffixx}|grep -v "grep"|awk '{print $2}'`
if [ -z "$mpid" ]; then
	echo "------FAILED to start the server!------"
else
	echo $mpid > pid.log
	echo "------start the server success !------"
fi


