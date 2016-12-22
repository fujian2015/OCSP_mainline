/**
 * Resource file for zh g18n
 */
angular.module('ocspApp').config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('zh', {
    'task_manage': '任务管理',
    'label_manage': '标签管理',
    'system_manage': '系统管理',
    'user_manage': '用户管理',
    'create_task': '新建任务',
    'create_task_1': '基础配置',
    'create_task_2': '设置输入',
    'create_task_3': '设置标签',
    'create_task_4': '设置输出',
    'create_task_5': '检查&提交',
    'add_task': '新增任务',
    'system_properties': '系统属性',
    'current_password': '当前密码',
    'new_password': '新密码',
    'new_password_again': '再次输入',
    'change_password': '修改密码',
    'password_wrong': '密码错误，请重试。',
    'username': '用户名',
    'password': '密码',
    'login': '登录',
    'pass_not_same': '两次输入的密码不一致',
    'timeh': '时',
    'timem': '分'
  });
}]);
