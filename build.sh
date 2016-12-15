#!/usr/bin/env bash

set -e

HOME_PATH=$(cd `dirname $0`; pwd)

cd ${HOME_PATH}

mvn clean package -Dmaven.test.skip=true

if [ $? -ne 0 ]; then
   echo "Build failed..."
   exit 1
fi


rm -fr build

mkdir -p build/OCDP_Stream/lib
mkdir -p build/OCDP_Stream/logs

cp -r bin build/OCDP_Stream
cp -r conf build/OCDP_Stream

cp core/target/core-2.0.1.jar build/OCDP_Stream/lib
cp core/target/core-2.0.1-dist/lib/jedis-*.jar build/OCDP_Stream/lib
cp core/target/core-2.0.1-dist/lib/jodis-*.jar build/OCDP_Stream/lib
cp core/target/core-2.0.1-dist/lib/commons-pool2-*.jar build/OCDP_Stream/lib
cp core/target/core-2.0.1-dist/lib/mysql-connector-java-*.jar build/OCDP_Stream/lib
cp core/target/core-2.0.1-dist/lib/spark-streaming-kafka-assembly_*.jar build/OCDP_Stream/lib
cp core/target/core-2.0.1-dist/lib/scala-library-*.jar build/OCDP_Stream/lib

#cp -r web build/OCDP_Stream

cd build

tar czf OCDP_Stream.tar.gz -C OCDP_Stream/ .

exit 0
