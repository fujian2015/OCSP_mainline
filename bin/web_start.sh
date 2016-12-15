#!/bin/bash

export PATH=/sbin:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/bin:/bin

if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi

command -v node >/dev/null 2>&1 || { echo "start web server failed! please install nodejs first: yum install -y nodejs" ; exit -1 ;}

FWDIR=$(cd `dirname $0`/..; pwd)

cd $FWDIR/web/

echo "===try to start web server" `date` " ===="
nohup node server/app.js >> $FWDIR/logs/web.log 2>&1 &

sleep 1

proc_name="app.js"
name_suffixx="\>"
mpid=`ps -ef|grep -i ${proc_name}${name_suffixx}|grep -v "grep"|awk '{print $2}'`
if [ -z "$mpid" ]; then
    echo "------FAILED to start the server!------"
fi

echo "please check log file to get server staus: " $FWDIR"/logs/web.log"

