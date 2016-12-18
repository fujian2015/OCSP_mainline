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
  `name` varchar(30) NOT NULL,
  `type` varchar(20) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `properties` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `name` varchar(30) NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `properties` text,
  PRIMARY KEY (`id`)
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
  `name` varchar(30) NOT NULL,
  `value` varchar(600) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `start_time` varchar(500) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `diid` int(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `STREAM_TASK_ibfk_1` (`diid`),
  CONSTRAINT `STREAM_TASK_ibfk_1` FOREIGN KEY (`diid`) REFERENCES `STREAM_DATAINTERFACE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `STREAM_USER`
--

DROP TABLE IF EXISTS `STREAM_USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `STREAM_USER` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `password` varchar(50) NOT NULL DEFAULT '',
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
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
