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

    'ocsp_web_user_manage_000':'用户管理',
    'ocsp_web_user_manage_001':'修改密码',
    'ocsp_web_user_manage_002':'当前密码',
    'ocsp_web_user_manage_003':'新密码',
    'ocsp_web_user_manage_004':'再次输入',
    'ocsp_web_user_manage_005':'密码错误，请重试',
    'ocsp_web_user_manage_006':'两次输入的密码不一致',

    'ocsp_web_system_manage_000':'系统管理',
    'ocsp_web_system_manage_001':'系统配置',
    'ocsp_web_system_manage_001':'基础设置',

    'ocsp_web_label_manage_000':'标签管理',
    'ocsp_web_label_manage_001':'标签名字',
    'ocsp_web_label_manage_002':'标签实现类',
    'ocsp_web_label_manage_003':'标签参数',



  });
}]);
