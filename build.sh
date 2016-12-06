#!/usr/bin/env bash

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

cp core/target/core-1.0-SNAPSHOT.jar build/OCDP_Stream/lib
cp core/target/core-1.0-SNAPSHOT-dist/lib/jedis-*.jar build/OCDP_Stream/lib
cp core/target/core-1.0-SNAPSHOT-dist/lib/jodis-*.jar build/OCDP_Stream/lib
cp core/target/core-1.0-SNAPSHOT-dist/lib/commons-pool2-*.jar build/OCDP_Stream/lib
cp core/target/core-1.0-SNAPSHOT-dist/lib/mysql-connector-java-*.jar build/OCDP_Stream/lib
cp core/target/core-1.0-SNAPSHOT-dist/lib/spark-streaming-kafka-assembly_*.jar build/OCDP_Stream/lib
cp core/target/core-1.0-SNAPSHOT-dist/lib/scala-library-*.jar build/OCDP_Stream/lib

cd build

tar czf OCDP_Stream.tar.gz OCDP_Stream

exit 0