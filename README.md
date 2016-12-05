# 橘云流处理平台(OCSP)


### 1. 概要

OCSP使用Lamda架构设计理念，在并行处理中，对流入的数据不做改动，数据进入流处理中进行分析，并将分析的结果流出系统。在整个流处理过程中（数据流入－>分析－>流出），避免使用落盘操作。这样能够极大的提升了数据的处理速度，保证了数据处理的实时性。
OCSP支持多种流数据输入，例如：Socket，文件，Kafka等。可以满足多种场景不同数据源的需求。OCSP支持将数据处理结果以多种方式输出，例如Kafka，Redis，HDFS等。
除了支持多种功能属性外，OCSP还具有高实时性、高扩展性、高易用性等特点。能够方便用户快速搭建、使用流处理平台。### 2. OCSP整体架构
   OCSP由数据接入层，流平台核心层，配置管理层，基础组件层等四部分组成。如图所示：
   ![OCSP架构图](http://ohpsj3ec3.bkt.clouddn.com/overview.png)* 数据接入层  数据接入层的主要作用是将外部数据源的输入数据转换为流平台能够识别和读取的消息队列Kafka数据。由flume提供数据接入转换功能，支持多种外部数据源的数据，默认支持Socket数据和文件流数据，支持定制化开发接入其他类型的数据。* 流处理层  流处理层的输入为经过数据接入层处理过的Kafka中的数据。在流处理过程中，使用key-value内存库保存需要的数据。使用内存库保存过程数据的主要目的。是提升整个流处理的效率。流处理的输出可以配置，支持输出到消息队列(Kafka)或者Codis／Redis中。
  * 配置管理层  OCSP中支持用户配置系统配置和业务相关配置。主要包括：
   * 系统配置
       配置流平台集群的系统相关配置。例如：Zookeeper地址，Spark运行模式，Codis地址，Kafka地址等。      * 业务配置

     业务相关配置主要有：如任务启动需要的资源，业务需要处理的标签，业务输入来自于Kafka的topic，业务输出地址等。
     * 基础组件层
  
  基础组件层提供OCSP依赖的大数据组件。是由橘云OCDP4.0提供Hadoop组件以及Spark组件，并由OCDP4.0 OCManager提供集群的可靠性和扩展性。### 3. 详细设计
* 数据接入层设计
   OCSP的数据接入层是基于flume的消息传输能力。使用定制化的source插件，能够支持多种数据源的操作。
   ![数据接入层](http://ohpsj3ec3.bkt.clouddn.com/datainput.png)* 流平台核心层设计
    流处理层由以下几个部分组成：
    ![数据处理层](http://ohpsj3ec3.bkt.clouddn.com/dataprocessing.png)       * 流输入
      以消息管道形式接收上游接入层处理后的数据        * 数据预处理
       对一个时间片内的数据进行预处理，去除不符合条件的数据。    * 标签逻辑运算
      根据配置，依次执行该业务各标签。
    * 过滤输出内容
      根据输出的配置，选择该业务需要输出的内容          * 判断输出条件
      根据输出条件，判断是否输出    * 输出类型选择
      选择输出类型为Kafka或者Codis    * 事件输出
      将事件结果输出* 配置管理
    * 系统配置
        Spark home，定义Spark home                Spark 运行类型，支持stand alone模式和yarn client模式        cacheManager类型，定义OCSP的cache方法        delaySeconds, 任务启动前的延迟启动时间        periodSeconds，检查各作业状态的周期        appJars，core程序运行依赖的jar包        jars，OCSP运行的spark streaming 依赖的所有jar包        cacheQryBatchSizeLimit，event中每次从cacheManager查询的数据量        cacheQryTaskSizeLimit，除event以外，其他业务中，每次从cacheManager查询的数据量        files，OCSP运行的spark streaming 依赖的文件
    * 业务配置
        输入Spark streaming的Kafka地址，Topic以及message格式
        输出到Kafka的数据Topic，message格式
        输出到Codis的数据Key名，message格式
        输入数据的过滤条件
        输出数据的过滤条件
        业务打的标签类型
        业务启动Spark streaming的配置：interval，executor数，executor内存，driver内存。

* UI

    * 用户登录
    
    ![login](http://ohpsj3ec3.bkt.clouddn.com/login.png)
    
    * 流业务状态
    
    ![job Summary](http://ohpsj3ec3.bkt.clouddn.com/jobsum.png)
    
    * 流业务配置
    
    ![job Configuration](http://ohpsj3ec3.bkt.clouddn.com/jobconf.png)
    
    * 创建作业
    
    ![create job](http://ohpsj3ec3.bkt.clouddn.com/createjob.png)
    