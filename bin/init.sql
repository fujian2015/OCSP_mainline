-- MySQL dump 10.13  Distrib 5.6.33, for Linux (x86_64)
--
-- Host: localhost    Database: ocsp
-- ------------------------------------------------------
-- Server version	5.6.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `STREAM_DATAINTERFACE`
--

DROP TABLE IF EXISTS `STREAM_DATAINTERFACE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_DATAINTERFACE` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `type` int(11) NOT NULL,
  `dsid` int(16) NOT NULL,
  `filter_expr` text,
  `description` text,
  `delim` varchar(10) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `properties` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dsid` (`dsid`,`name`),
  CONSTRAINT `STREAM_DATAINTERFACE_ibfk_1` FOREIGN KEY (`dsid`) REFERENCES `STREAM_DATASOURCE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_DATAINTERFACE`
--

LOCK TABLES `STREAM_DATAINTERFACE` WRITE;
/*!40000 ALTER TABLE `STREAM_DATAINTERFACE` DISABLE KEYS */;
INSERT INTO `STREAM_DATAINTERFACE` VALUES (1,'di1_input_kafka_topic_stream1',0,1,'',NULL,'\\|',1,'{\"props\":[{\"pname\":\"topic\",\"pvalue\":\"betainput\"},{\"pname\":\"direct_kafka_api_flag\",\"pvalue\":\"true\"},{\"pname\":\"field.numbers\",\"pvalue\":\"17\"},{\"pname\":\"uniqKeys\",\"pvalue\":\"imsi\"},{\"pname\":\"UKSeparator\",\"pvalue\":\"#\"},{\"pname\":\"num.consumer.fetchers\",\"pvalue\":\"4\"},{\"pname\":\"batchSize\",\"pvalue\":\"100\"}],\"fields\":[{\"pname\":\"timestamp\",\"ptype\":\"string\"},{\"pname\":\"endtime\",\"ptype\":\"string\"},{\"pname\":\"phoneNum\",\"ptype\":\"String\"},{\"pname\":\"imsi\",\"ptype\":\"String\"},{\"pname\":\"dataType\",\"ptype\":\"String\"},{\"pname\":\"lac\",\"ptype\":\"String\"},{\"pname\":\"cell\",\"ptype\":\"String\"},{\"pname\":\"endlac\",\"ptype\":\"String\"},{\"pname\":\"endcell\",\"ptype\":\"String\"},{\"pname\":\"bitholding1\",\"ptype\":\"String\"},{\"pname\":\"bitholding2\",\"ptype\":\"String\"},{\"pname\":\"bitholding3\",\"ptype\":\"String\"},{\"pname\":\"toPhoneNum\",\"ptype\":\"String\"},{\"pname\":\"bitholding4\",\"ptype\":\"String\"},{\"pname\":\"bitholding5\",\"ptype\":\"String\"},{\"pname\":\"bitholding6\",\"ptype\":\"String\"},{\"pname\":\"bitholding7\",\"ptype\":\"String\"}],\"userFields\":[]}'),(2,'di2_output_kafka_full',1,1,'imsi != \"\"',NULL,',',1,'{    \"props\": [        {            \"pname\": \"topic\",            \"pvalue\": \"output1\"        },        {            \"pname\": \"direct_kafka_api_flag\",            \"pvalue\": \"true\"        },        {            \"pname\": \"field.numbers\",            \"pvalue\": \"17\"        },        {            \"pname\": \"uniqKeys\",            \"pvalue\": \"imsi\"        },        {            \"pname\": \"UKSeparator\",            \"pvalue\": \"#\"        },        {            \"pname\": \"num.consumer.fetchers\",            \"pvalue\": \"4\"        },        {            \"pname\": \"batchSize\",            \"pvalue\": \"100\"        }    ],    \"fields\": [        {            \"pname\": \"eventId\",            \"ptype\": \"Int\"        },        {            \"pname\": \"timestamp\",            \"ptype\": \"string\"        },        {            \"pname\": \"latestTimestamp\",            \"ptype\": \"string\"        },        {            \"pname\": \"imsi\",            \"ptype\": \"String\"        },        {            \"pname\": \"tour_area\",            \"ptype\": \"String\"        },        {            \"pname\": \"lac\",            \"ptype\": \"String\"        },        {            \"pname\": \"cell\",            \"ptype\": \"String\"        }    ],    \"userFields\": []}'),(3,'output_codis',1,2,'imsi != \"\"',NULL,'',1,'{\"props\": [{\"pname\": \"codisKeyPrefix\",\"pvalue\": \"siteposition\"},{\"pname\": \"field.numbers\",\"pvalue\": \"17\"},{\"pname\": \"uniqKeys\",\"pvalue\": \"imsi\"},{\"pname\": \"UKSeparator\",\"pvalue\": \"#\"},{\"pname\": \"num.consumer.fetchers\",\"pvalue\": \"4\"},{\"pname\": \"batchSize\",\"pvalue\": \"100\"}],\"fields\": [{\"pname\": \"timestamp\",\"ptype\": \"string\"},{\"pname\": \"latestTimestamp\",\"ptype\": \"string\"},{\"pname\": \"imsi\",\"ptype\": \"String\"},{\"pname\": \"tour_area\",\"ptype\": \"String\"},{\"pname\": \"lac\",\"ptype\": \"String\"},{\"pname\": \"cell\",\"ptype\": \"String\"}],\"userFields\": []}'),(4,'output_kafka_area',1,1,'',NULL,'',1,'{\"props\":[{\"pname\":\"topic\",\"pvalue\":\"output2\"},{\"pname\":\"direct_kafka_api_flag\",\"pvalue\":\"true\"},{\"pname\":\"field.numbers\",\"pvalue\":\"17\"},{\"pname\":\"uniqKeys\",\"pvalue\":\"imsi\"},{\"pname\":\"UKSeparator\",\"pvalue\":\"#\"},{\"pname\":\"num.consumer.fetchers\",\"pvalue\":\"4\"},{\"pname\":\"batchSize\",\"pvalue\":\"100\"}],\"fields\":[],\"userFields\":[]}');
/*!40000 ALTER TABLE `STREAM_DATAINTERFACE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STREAM_DATASOURCE`
--

DROP TABLE IF EXISTS `STREAM_DATASOURCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_DATASOURCE` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `type` varchar(20) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `properties` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_DATASOURCE`
--

LOCK TABLES `STREAM_DATASOURCE` WRITE;
/*!40000 ALTER TABLE `STREAM_DATASOURCE` DISABLE KEYS */;
INSERT INTO `STREAM_DATASOURCE` VALUES (1,'ds1_kafka','kafka',NULL,'[{\"pname\":\"zookeeper.connect\",\"pvalue\":\"ochadoop02:2181\"},{\"pname\":\"metadata.broker.list\",\"pvalue\":\"ochadoop02:6667\"}]'),(2,'ds2_codis','codis',NULL,'[{\"pname\":\"cacheServers\",\"pvalue\":\"ochadoop02:19000,ochadoop04:19001\"},{\"pname\":\"jedisMaxIdle\",\"pvalue\":\"300\"},{\"pname\":\"jedisMaxTotal\",\"pvalue\":\"1000\"},{\"pname\":\"jedisMEM\",\"pvalue\":\"600000\"},{\"pname\":\"jedisMinIdle\",\"pvalue\":\"0\"},{\"pname\":\"zk\",\"pvalue\":\"ochadoop02:2181,ochadoop04:2181\"},{\"pname\":\"zkSessionTimeoutMs\",\"pvalue\":\"15\"},{\"pname\":\"zkpath\",\"pvalue\":\"/zk/codis/db_codis-ha-demo/proxy\"},{\"pname\":\"jedisTimeOut\",\"pvalue\":\"10000\"}]');
/*!40000 ALTER TABLE `STREAM_DATASOURCE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STREAM_EVENT`
--

DROP TABLE IF EXISTS `STREAM_EVENT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_EVENT` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `diid` int(16) NOT NULL,
  `select_expr` text,
  `filter_expr` text,
  `p_event_id` int(16) DEFAULT NULL,
  `PROPERTIES` text,
  `status` int(11) NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `diid` (`diid`,`name`),
  CONSTRAINT `STREAM_EVENT_ibfk_1` FOREIGN KEY (`diid`) REFERENCES `STREAM_DATAINTERFACE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_EVENT`
--

LOCK TABLES `STREAM_EVENT` WRITE;
/*!40000 ALTER TABLE `STREAM_EVENT` DISABLE KEYS */;
INSERT INTO `STREAM_EVENT` VALUES (1,'event1',1,'imsi,lac,cell,tour_area,isAccu_tour,security_area,isAccu_security,timestamp','full_path=\'true\'',1,'{\"props\":[{\"pname\":\"userKeyIdx\", \"pvalue\":\"2\"}],\"output_dis\":[{\"diid\":\"2\",\"interval\": \"10\",\"delim\" :\",\"}]}',1,'a'),(3,'event3',1,'imsi,lac,cell,timestamp,isLatestSite,tour_area,security_area,acyc_id,live_lac,area_code,work_lac,work_cellid,stat_date,serial_number,age_level,sex,eparchy_id,city_code,pspt_prov_code,pspt_eparchy_id,fee_level,city_name','isLatestSite=\'true\'',3,'{\"props\":[{\"pname\":\"userKeyIdx\", \"pvalue\":\"2\"}],\"output_dis\":[{\"diid\":\"3\",\"interval\": \"0\",\"delim\" :\",\"}]}',1,NULL),(4,'event4',1,'imsi,lac,cell,tour_area,isAccu_tour,security_area,isAccu_security,timestamp','isAccu_tour=\'true\' OR isAccu_security=\'ture\'',4,'{\"props\":[{\"pname\":\"userKeyIdx\", \"pvalue\":\"2\"}],\"output_dis\":[{\"diid\":\"4\",\"interval\": \"0\",\"delim\" :\",\"}]}',1,NULL);
/*!40000 ALTER TABLE `STREAM_EVENT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STREAM_LABEL`
--

DROP TABLE IF EXISTS `STREAM_LABEL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_LABEL` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `diid` int(16) NOT NULL,
  `p_label_id` int(16) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  `label_id` int(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `STREAM_LABEL_ibfk_1` (`diid`),
  CONSTRAINT `STREAM_LABEL_ibfk_1` FOREIGN KEY (`diid`) REFERENCES `STREAM_DATAINTERFACE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_LABEL`
--

LOCK TABLES `STREAM_LABEL` WRITE;
/*!40000 ALTER TABLE `STREAM_LABEL` DISABLE KEYS */;
INSERT INTO `STREAM_LABEL` VALUES (1,1,NULL,1,'',1),(2,1,NULL,1,'',2),(3,1,NULL,1,'',3),(4,1,2,1,NULL,4);
/*!40000 ALTER TABLE `STREAM_LABEL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STREAM_LABEL_DEFINITION`
--

DROP TABLE IF EXISTS `STREAM_LABEL_DEFINITION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_LABEL_DEFINITION` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `properties` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_LABEL_DEFINITION`
--

LOCK TABLES `STREAM_LABEL_DEFINITION` WRITE;
/*!40000 ALTER TABLE `STREAM_LABEL_DEFINITION` DISABLE KEYS */;
INSERT INTO `STREAM_LABEL_DEFINITION` VALUES (1,'SiteLabel','com.asiainfo.ocdp.local.shaanxiyidong.label.SiteLabel','{\"props\":[{\"pname\":\"userKeyIdx\", \"pvalue\":\"2\"}],\"labelItems\":[{\"pname\":\"phone_no\", \"pvalue\":\"product_no\"}]}'),(2,'AreaLabel','com.asiainfo.ocdp.local.shaanxiyidong.label.AreaLabel','{\"props\":[{\"pname\":\"user_info_cols\", \"pvalue\":\"phone_no,user_id,phone_area\"}],\"labelItems\":[{\"pname\":\"phone_no\", \"pvalue\":\"product_no\"}]}'),(3,'UserBaseInfoLabel','com.asiainfo.ocdp.local.shaanxiyidong.label.UserBaseInfoLabel','{\"props\":[{\"pname\":\"user_info_cols\", \"pvalue\":\"acyc_id,live_lac,area_code,work_lac,work_cellid,stat_date,serial_number,age_level,sex,eparchy_id,city_code,pspt_prov_code,pspt_eparchy_id,fee_level\"}],\"labelItems\":[{\"pname\":\"phone_no\", \"pvalue\":\"product_no\"}]}'),(4,'AccumulateLabel','com.asiainfo.ocdp.local.shaanxiyidong.label.AccumulateLabel','{\"props\":[{\"pname\":\"interval\", \"pvalue\":\"10\"}],\"labelItems\":[{\"pname\":\"interval\", \"pvalue\":\"10\"}]}');
/*!40000 ALTER TABLE `STREAM_LABEL_DEFINITION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STREAM_SYSTEMPROP`
--

DROP TABLE IF EXISTS `STREAM_SYSTEMPROP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_SYSTEMPROP` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `value` varchar(600) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_SYSTEMPROP`
--

LOCK TABLES `STREAM_SYSTEMPROP` WRITE;
/*!40000 ALTER TABLE `STREAM_SYSTEMPROP` DISABLE KEYS */;
INSERT INTO `STREAM_SYSTEMPROP` VALUES (1,'cacheManager','JodisCacheManager',0,NULL),(7,'checkpoint_dir','streaming/checkpoint',0,NULL),(11,'SPARK_HOME','/usr/hdp/2.4.0.0-169/spark',1,NULL),(12,'master','yarn-client',1,NULL),(13,'supervise','false',0,NULL),(17,'delaySeconds','20',0,NULL),(18,'periodSeconds','10',0,NULL),(19,'appJars','core-1.0-SNAPSHOT.jar',0,NULL),(20,'jars','mysql-connector-java-5.1.34.jar,spark-streaming-kafka-assembly_2.10-1.6.0.jar,common.xml,log4j.properties,commons-pool2-2.0.jar,jodis-0.3.0.jar,ShaanxiyidongFeature-1.0-SNAPSHOT.jar,jedis-2.8.0.jar,core-1.0-SNAPSHOT.jar',0,NULL),(21,'cacheQryBatchSizeLimit','50',0,NULL),(27,'cacheQryTaskSizeLimit','50',0,NULL),(28,'files','/usr/ocsp/OCDP_Stream/lib/common.xml',0,NULL);
/*!40000 ALTER TABLE `STREAM_SYSTEMPROP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `STREAM_TASK`
--

DROP TABLE IF EXISTS `STREAM_TASK`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_TASK` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) DEFAULT NULL,
  `type` int(11) NOT NULL,
  `receive_interval` int(11) NOT NULL DEFAULT '5',
  `num_executors` int(11) NOT NULL DEFAULT '2',
  `driver_memory` varchar(5) NOT NULL DEFAULT '2g',
  `executor_memory` varchar(5) NOT NULL DEFAULT '2g',
  `total_executor_cores` int(11) NOT NULL DEFAULT '2',
  `queue` varchar(100) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  `diid` int(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `STREAM_TASK_ibfk_1` (`diid`),
  CONSTRAINT `STREAM_TASK_ibfk_1` FOREIGN KEY (`diid`) REFERENCES `STREAM_DATAINTERFACE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_TASK`
--

LOCK TABLES `STREAM_TASK` WRITE;
/*!40000 ALTER TABLE `STREAM_TASK` DISABLE KEYS */;
INSERT INTO `STREAM_TASK` VALUES (1,'task1',1,30,10,'1g','1g',2,'default',0,NULL,1);
/*!40000 ALTER TABLE `STREAM_TASK` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-11-09 13:31:05
