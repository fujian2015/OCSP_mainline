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
  `name` varchar(255) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_DATASOURCE`
--

DROP TABLE IF EXISTS `STREAM_DATASOURCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_DATASOURCE` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(20) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  `properties` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_DATASOURCE`
--

LOCK TABLES `STREAM_DATASOURCE` WRITE;
/*!40000 ALTER TABLE `STREAM_DATASOURCE` DISABLE KEYS */;
INSERT INTO `STREAM_DATASOURCE` VALUES (1,'Kafka data source','kafka',1,NULL,'[{\"pname\":\"zookeeper.connect\",\"pvalue\":\"hostA:2181\"},{\"pname\":\"metadata.broker.list\",\"pvalue\":\"hostA:6667\"}]'),(2,'Codis data source','codis',1,NULL,'[{\"pname\":\"cacheServers\",\"pvalue\":\"hostB:19000\"},{\"pname\":\"jedisMaxIdle\",\"pvalue\":\"300\"},{\"pname\":\"jedisMaxTotal\",\"pvalue\":\"1000\"},{\"pname\":\"jedisMEM\",\"pvalue\":\"600000\"},{\"pname\":\"jedisMinIdle\",\"pvalue\":\"0\"},{\"pname\":\"zk\",\"pvalue\":\"hostA:2181\"},{\"pname\":\"zkSessionTimeoutMs\",\"pvalue\":\"15000\"},{\"pname\":\"zkpath\",\"pvalue\":\"/zk/codis/db_codis-demo/proxy\"},{\"pname\":\"jedisTimeOut\",\"pvalue\":\"10000\"}]');
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
  `name` varchar(255) NOT NULL,
  `diid` int(16) NOT NULL,
  `select_expr` text,
  `filter_expr` text,
  `p_event_id` int(16) DEFAULT NULL,
  `PROPERTIES` text,
  `status` int(11) NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `diid` (`diid`,`name`),
  CONSTRAINT `STREAM_EVENT_ibfk_1` FOREIGN KEY (`diid`) REFERENCES `STREAM_DATAINTERFACE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_LABEL_DEFINITION`
--

DROP TABLE IF EXISTS `STREAM_LABEL_DEFINITION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_LABEL_DEFINITION` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `properties` text,
  `owner` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_SYSTEMPROP`
--

DROP TABLE IF EXISTS `STREAM_SYSTEMPROP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_SYSTEMPROP` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `value` varchar(600) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `STREAM_SYSTEMPROP`
--

LOCK TABLES `STREAM_SYSTEMPROP` WRITE;
/*!40000 ALTER TABLE `STREAM_SYSTEMPROP` DISABLE KEYS */;
INSERT INTO `STREAM_SYSTEMPROP` VALUES (1,'cacheManager','JodisCacheManager',0,NULL),(2,'ocsp.monitor.task-monitor.enable','true',0,''),(3,'ocsp.monitor.task-monitor.retain-check-interval-mins','2880',0,''),(4,'ocsp.monitor.task-monitor.retain-mins','10080',0,''),(7,'checkpoint_dir','streaming/checkpoint',0,NULL),(11,'SPARK_HOME','/usr/hdp/2.4.0.0-169/spark',1,'Spark安装路径'),(12,'master','yarn',1,'Spark应用程序的运行模式'),(13,'supervise','false',0,NULL),(17,'delaySeconds','20',0,NULL),(18,'periodSeconds','10',0,NULL),(21,'cacheQryBatchSizeLimit','1000',0,NULL),(27,'cacheQryTaskSizeLimit','1000',0,NULL),(29,'ocsp.event.cep.enable','false',0,NULL),(30,'ocsp.kerberos.enable','false',1,NULL);
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
  `name` varchar(255) DEFAULT NULL,
  `appID` varchar(256) DEFAULT NULL,
  `type` int(11) NOT NULL,
  `receive_interval` int(11) NOT NULL DEFAULT '5',
  `num_executors` int(11) NOT NULL DEFAULT '2',
  `driver_memory` varchar(5) NOT NULL DEFAULT '2g',
  `executor_memory` varchar(5) NOT NULL DEFAULT '2g',
  `executor_cores` int(11) NOT NULL DEFAULT '2',
  `queue` varchar(100) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `start_time` varchar(500) DEFAULT NULL,
  `stop_time` varchar(500) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `retry` int(11) NOT NULL DEFAULT '0',
  `cur_retry` int(11) NOT NULL DEFAULT '0',
  `diid` int(16) NOT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `heartbeat` varchar(500) DEFAULT NULL,
  `recover_mode` varchar(255) DEFAULT "from_latest",
  PRIMARY KEY (`id`),
  KEY `STREAM_TASK_ibfk_1` (`diid`),
  CONSTRAINT `STREAM_TASK_ibfk_1` FOREIGN KEY (`diid`) REFERENCES `STREAM_DATAINTERFACE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_TASK_MONITOR`
--

DROP TABLE IF EXISTS `STREAM_TASK_MONITOR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_TASK_MONITOR` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` int(16) NOT NULL,
  `timestamp` timestamp NOT NULL,
  `reserved_records` bigint(20) NOT NULL,
  `dropped_records` bigint(20) NOT NULL,
  `archived` int(11) NOT NULL DEFAULT '0',
  `application_id` varchar(255) NOT NULL,
  `batch_running_time_ms` varchar(500) DEFAULT NULL,
  `max_storage_memory` bigint(20) NOT NULL,
  `used_storage_memory` bigint(20) NOT NULL,
  `remaining_storage_memory` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_USER`
--

DROP TABLE IF EXISTS `STREAM_USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_USER` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `password` varchar(200) NOT NULL DEFAULT '',
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `STREAM_USER` WRITE;
/*!40000 ALTER TABLE `STREAM_USER` DISABLE KEYS */;
INSERT INTO `STREAM_USER` VALUES (1,'ocspadmin','8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918','Administrator');
/*!40000 ALTER TABLE `STREAM_USER` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `STREAM_USER_SECURITY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_USER_SECURITY` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `spark_principal` varchar(500) DEFAULT NULL,
  `spark_keytab` varchar(500) DEFAULT NULL,
  `kafka_principal` varchar(500) DEFAULT NULL,
  `kafka_keytab` varchar(500) DEFAULT NULL,
  `kafka_jaas` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_EXCEPTION`
--
DROP TABLE IF EXISTS `STREAM_EXCEPTION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_EXCEPTION` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `taskID` int(16) NOT NULL ,
  `appID` varchar(256) DEFAULT NULL,
  `exception_type` int(16) NOT NULL ,
  `exception_info` varchar(500) DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT '0',
  `begin_time` DATETIME NOT NULL, 
  `end_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_EVENT_TYPE_MAPPING`
--

DROP TABLE IF EXISTS `STREAM_TYPE_STRUCTURE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_TYPE_STRUCTURE` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) NOT NULL,
  `parent_type` int(16) DEFAULT NULL,
  `children_types` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_HISTORY_CONFIG`
--

DROP TABLE IF EXISTS `STREAM_HISTORY_CONFIG`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_HISTORY_CONFIG` (
  `config_id` int(11) NOT NULL AUTO_INCREMENT,
  `component_name` varchar(256) NOT NULL,
  `version` varchar(256) DEFAULT '',
  `id` int(11) NOT NULL,
  `config_data` text NOT NULL,
  `create_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_name` varchar(256),
  `note` text,
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_EVENT_CEP`
--

DROP TABLE IF EXISTS `STREAM_EVENT_CEP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_EVENT_CEP` (
  `event_id` int(16) NOT NULL,
  `type` int(16) DEFAULT NULL,
  `code` varchar(256) DEFAULT NULL,
  `identifier` varchar(256) DEFAULT NULL,
  `source` varchar(256) DEFAULT NULL,
  `monitor_fields` varchar(512) DEFAULT NULL,
  `badge_number` varchar(512) DEFAULT NULL,
  `create_time` varchar(512) DEFAULT NULL,
  `reserve_1` varchar(512) DEFAULT NULL,
  `reserve_2` varchar(512) DEFAULT NULL,
  `reserve_3` varchar(512) DEFAULT NULL,
  `reserve_4` varchar(512) DEFAULT NULL,
  `reserve_5` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  FOREIGN KEY (`event_id`) REFERENCES `STREAM_EVENT` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-11-09 13:31:05
