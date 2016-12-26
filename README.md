# 橘云流处理平台(OCSP)

### 介绍

OCSP是基于Spark streaming的处理流数据低延迟、可高度扩展的，满足海量且多样化数据源处理的高性能平台。OCSP支持多种流数据输入，例如：Socket，文件，Kafka等。可以满足多种场景不同数据源的需求。OCSP支持将数据处理结果以多种方式输出，例如Kafka，Redis，HDFS等。OCSP还具有高实时性、高扩展性、高易用性等特点。能够方便用户快速搭建、使用流处理平台。

### 功能

* 主要功能
 
| 主要功能       | 二级功能        |
| ------------- |:-------------:|
| 事件处理       | 流数据读取      |
|               | 数据预处理      |
|               | 标签逻辑运算     |
|               | 数据缓存        |
|               | 数据订阅        |
|               | 事件输出        |
| 配置管理       | 接口适配规则管理  |
|               | 预处理规则管理  |
|               | 标签管理    |
|               | 处理规则管理   |
|               | 订阅管理   |
|               | 系统参数管理   |
| 监控管理       | 时间流全景展示  |
|               | 服务状态监测  |
|               | 服务启动/停止操作  |

     

* 架构 [详细架构](https://github.com/OCSP/OCSP_mainline/wiki/OCSP%E6%9E%B6%E6%9E%84%E8%AF%B4%E6%98%8E%E6%96%87%E6%A1%A3)

   OCSP由数据接入层，流平台核心层，配置管理层，基础组件层等四部分组成。如图所示：

   ![OCSP架构图](http://ohpsj3ec3.bkt.clouddn.com/overview.png)
   
* 前台界面
 
     * 作业状态界面
 
      ![前台页面展示1](http://ohpsj3ec3.bkt.clouddn.com/web1.png)

     * 作业配置界面
     
      ![前台页面展示2](http://ohpsj3ec3.bkt.clouddn.com/web2.png)

     * 作业创建界面
  
         ![前台页面展示3](http://ohpsj3ec3.bkt.clouddn.com/web3.png)


### 安装部署方法

* [编译方法](https://github.com/OCSP/OCSP_mainline/wiki/编译OCSP源代码方法)

* [安装部署](https://github.com/OCSP/OCSP_mainline/wiki/安装部署)

* [Codis部署](https://github.com/OCSP/OCSP_mainline/wiki/Codis-%E9%83%A8%E7%BD%B2)

* [YARN标签设置](https://github.com/OCSP/OCSP_mainline/wiki/Yarn-Node-Label-%E9%85%8D%E7%BD%AE)

### 使用及调优

* [使用文档](https://github.com/OCSP/OCSP_mainline/wiki/使用文档)
* [自定义标签开发](https://github.com/OCSP/OCSP_mainline/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E6%A0%87%E7%AD%BE)
* [OCSP调优](https://github.com/OCSP/OCSP_mainline/wiki/OCSP-%E8%B0%83%E4%BC%98)

### Milestone

*   2016 Nov. [V2.0.0](https://github.com/OCSP/OCSP_mainline/releases/tag/2.0.0) 

### FAQ
* 常见问题
