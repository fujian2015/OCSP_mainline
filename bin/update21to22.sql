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
-- Dumping data for table `STREAM_SYSTEMPROP`
--

LOCK TABLES `STREAM_SYSTEMPROP` WRITE;
/*!40000 ALTER TABLE `STREAM_SYSTEMPROP` DISABLE KEYS */;
INSERT INTO `STREAM_SYSTEMPROP` VALUES (29,'ocsp.event.cep.enable','false',0,NULL),(30,'ocsp.kerberos.enable','false',1,NULL);
/*!40000 ALTER TABLE `STREAM_SYSTEMPROP` ENABLE KEYS */;
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
