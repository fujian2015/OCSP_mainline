/**
 * Resource file for en g18n
 */
angular.module('ocspApp').config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('en', {
    'ocsp_web_common_000': 'OCSP',
    'ocsp_web_common_001': 'Username',
    'ocsp_web_common_002': 'Password',
    'ocsp_web_common_003': 'Sign in',
    'ocsp_web_common_004': 'Sign out',
    'ocsp_web_common_005': 'H',
    'ocsp_web_common_006': 'M',
    'ocsp_web_common_007': 'Next',
    'ocsp_web_common_008': 'Back',
    'ocsp_web_common_009': 'Save',
    'ocsp_web_common_010': 'Upload',
    'ocsp_web_common_011': 'Name',
    'ocsp_web_common_012': 'Description',
    'ocsp_web_common_013':'Basic configuration',

    'ocsp_web_user_manage_000':'User Management',
    'ocsp_web_user_manage_001':'Change password',
    'ocsp_web_user_manage_002':'Current password',
    'ocsp_web_user_manage_003':'New password',
    'ocsp_web_user_manage_004':'Retype new password',
    'ocsp_web_user_manage_005':'Password is wrong, please retry',
    'ocsp_web_user_manage_006':'The two passwords you entered did not match',

    'ocsp_web_system_manage_000':'System Management',
    'ocsp_web_system_manage_001':'System configuration',

    'ocsp_web_label_manage_000':'Label management',
    'ocsp_web_label_manage_001':'Label Name',
    'ocsp_web_label_manage_002':'Label Implementation Class',
    'ocsp_web_label_manage_003':'Label Parameters',

    'ocsp_web_streams_manage_000':'Streams Management',
    'ocsp_web_streams_manage_001':'Add Streams',
    'ocsp_web_streams_manage_002':'Summary',
    'ocsp_web_streams_manage_003':'Configs',
    'ocsp_web_streams_manage_004':'Please choose a stream first',
    'ocsp_web_streams_manage_005':'QuickLinks',
    'ocsp_web_streams_manage_006':'Setup input source',
    'ocsp_web_streams_manage_007':'Setup label',
    'ocsp_web_streams_manage_008':'Setup output event',
    'ocsp_web_streams_manage_009':'Review&Submit',
    'ocsp_web_streams_manage_010':'The name of Kafka topic',
    'ocsp_web_streams_manage_011':'Fields',
    'ocsp_web_streams_manage_012':'Delim',
    'ocsp_web_streams_manage_013':'Filter',
    'ocsp_web_streams_manage_014':'Unique key',
    'ocsp_web_streams_manage_015':'Please select',
    'ocsp_web_streams_manage_016':'Add output event',
    'ocsp_web_streams_manage_017':'Event name',
    'ocsp_web_streams_manage_018':'Fields for output',
    'ocsp_web_streams_manage_019':'Delim for output fields',
    'ocsp_web_streams_manage_020':'Interval of output event',
    'ocsp_web_streams_manage_021':'The source of output event',
    'ocsp_web_streams_manage_022':'The prefix of codis key'
  });
}]);
