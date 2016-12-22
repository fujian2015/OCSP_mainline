/**
 * Resource file for zh g18n
 */
angular.module('ocspApp').config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('zh', {
    'ocsp_web_common_000': '橘云流处理平台',
    'ocsp_web_common_001': '用户名',
    'ocsp_web_common_002': '密码',
    'ocsp_web_common_003': '登录',
    'ocsp_web_common_004': '退出',
    'ocsp_web_common_005': '时',
    'ocsp_web_common_006': '分',
    'ocsp_web_common_007': '下一步',
    'ocsp_web_common_008': '上一步',
    'ocsp_web_common_009': '保存',
    'ocsp_web_common_010': '上传',
    'ocsp_web_common_011': '名字',
    'ocsp_web_common_012': '描述',
    'ocsp_web_common_013': '基础配置',

    'ocsp_web_user_manage_000':'用户管理',
    'ocsp_web_user_manage_001':'修改密码',
    'ocsp_web_user_manage_002':'当前密码',
    'ocsp_web_user_manage_003':'新密码',
    'ocsp_web_user_manage_004':'再次输入',
    'ocsp_web_user_manage_005':'密码错误，请重试',
    'ocsp_web_user_manage_006':'两次输入的密码不一致',

    'ocsp_web_system_manage_000':'系统管理',
    'ocsp_web_system_manage_001':'系统配置',

    'ocsp_web_label_manage_000':'标签管理',
    'ocsp_web_label_manage_001':'标签名字',
    'ocsp_web_label_manage_002':'标签实现类',
    'ocsp_web_label_manage_003':'标签参数',

    'ocsp_web_streams_manage_000':'作业流管理',
    'ocsp_web_streams_manage_001':'新建作业流',
    'ocsp_web_streams_manage_002':'作业流概要',
    'ocsp_web_streams_manage_003':'作业流配置',
    'ocsp_web_streams_manage_004':'请先选择一个作业流',
    'ocsp_web_streams_manage_005':'链接',
    'ocsp_web_streams_manage_006':'设置输入',
    'ocsp_web_streams_manage_007':'设置标签',
    'ocsp_web_streams_manage_008':'设置输出',
    'ocsp_web_streams_manage_009':'检查&提交',
    'ocsp_web_streams_manage_010':'Kafka中topic的名字',
    'ocsp_web_streams_manage_011':'输入源的字段',
    'ocsp_web_streams_manage_012':'输入源字段分隔符',
    'ocsp_web_streams_manage_013':'过滤条件',
    'ocsp_web_streams_manage_014':'作为主键的字段',
    'ocsp_web_streams_manage_015':'请选择',
    'ocsp_web_streams_manage_016':'添加输出事件',
    'ocsp_web_streams_manage_017':'事件名字',
    'ocsp_web_streams_manage_018':'需要输出的字段',
    'ocsp_web_streams_manage_019':'输出字段分隔符',
    'ocsp_web_streams_manage_020':'输出事件的时间间隔',
    'ocsp_web_streams_manage_021':'事件输出源',
    'ocsp_web_streams_manage_022':'输出到Codis中Key的前缀'

  });
}]);
