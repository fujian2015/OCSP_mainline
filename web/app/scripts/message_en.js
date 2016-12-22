/**
 * Resource file for en g18n
 */
angular.module('ocspApp').config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('en', {
    'task_manage': 'Task management',
    'label_manage': 'Label management',
    'system_manage': 'System Management',
    'user_manage': 'User Management',
    'create_task': 'Create Task',
    'create_task_1': 'Basic configuration',
    'create_task_2': 'Set input',
    'create_task_3': 'Set label',
    'create_task_4': 'Set output',
    'create_task_5': 'Review & submit',
    'add_task': 'Add task',
    'system_properties': 'System properties',
    'current_password': 'Current password',
    'new_password': 'New password',
    'new_password_again': 'Confirm',
    'change_password': 'Change password',
    'password_wrong': 'Password is wrong, please double check.',
    'username': 'Username',
    'password': 'Password',
    'login': 'login',
    'pass_not_same': 'Input passwords are not same',
    'timeh': 'h',
    'timem': 'm'
  });
}]);
