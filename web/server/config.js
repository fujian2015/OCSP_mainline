module.exports = {
  dev: {
    mysql: 'mysql://root:123@127.0.0.1:3306/ocsp',
    dist: 'app',
    port: 9000
  },
  prod: {
    mysql: 'mysql://root:123@127.0.0.1:3306/ocsp',
    dist: 'dist',
    port: 9000
  },
  quickLinks : [
    {name: "Spark Streaming", value: "http://103.235.245.156:18080/"},
    {name: "Codis Dashboard", value: "http://103.235.245.156:8099/#codis-demo"}
  ],
  env: "prod", // By default use prod env
  trans: "zh",
  zh:{
    databaseError: "请检查数据库配置",
    inputDuplicateKey: ",输入源的名字已经被使用"
  },
  en:{
    databaseError: "Please check your database configurations",
    inputDuplicateKey: ",input data interface name has been used"
  }
};
