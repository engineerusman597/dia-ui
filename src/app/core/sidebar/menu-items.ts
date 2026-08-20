import { MenuInfo } from './menu-info';

export const ROUTES: MenuInfo[] = [
  {
    path: 'dashboard',
    title: 'DASHBOARD',
    icon: 'monitor',
    class: '',
    submenu: [],
    hasClaims: ['dashboard_list'],
  },
  {
    path: '',
    title: 'Clients',
    icon: 'user',
    class: 'menu-toggle',
    submenu: [
      {
        path: 'clients/list',
        title: 'Client List',
        icon: 'list',
        class: 'ml-menu',
        submenu: [],
        hasClaims: ['client_list'],
      },
      {
        path: 'clients/manage',
        title: 'Add New',
        icon: 'edit',
        class: 'ml-menu',
        submenu: [],
        hasClaims: ['client_create', 'client_edit'],
      },
      {
        path: 'bulk-upload-clients',
        title: 'Bulk Upload Clients',
        icon: 'cloud_upload',
        class: 'ml-menu',
        submenu: [],
        hasClaims: [],
      },
    ],
    hasClaims: ['client_list'],
  },
  {
    path: 'bulk-assign',
    title: 'Bulk Assigned',
    icon: 'file-text',
    class: '',
    submenu: [],
    hasClaims: [],
  },
  {
    path: 'file-requests',
    title: 'Document Requests',
    icon: 'file',
    class: '',
    submenu: [],
    hasClaims: ['file_request_list'],
  },
  {
    path: 'users',
    title: 'USERS',
    icon: 'users',
    class: '',
    submenu: [],
    hasClaims: ['user_list'],
  },
  {
    path: 'reports',
    title: 'Reports',
    icon: 'bar-chart',
    class: '',
    submenu: [],
    hasClaims: ['report_list'],
  },
  {
    path: '',
    title: 'EMAIL',
    icon: 'mail',
    class: 'menu-toggle',
    hasClaims: [
      'email_template_list',
      'email_smtp_list',
      'send_email_list'
    ],
    submenu: [
      {
        path: '/email-template',
        title: 'EMAIL_TEMPLATE',
        icon: 'email',
        class: 'ml-menu',
        submenu: [],
        hasClaims: ['email_template_list'],
      }
    ],
  },

  {
    path: '',
    title: 'SETTINGS',
    icon: 'settings',
    class: 'menu-toggle',
    hasClaims: [
      'app_settings_list',
      'action_list',
      'page_list',
      'page_action_edit',
      'page_helper_list',
    ],
    submenu: [
      {
        path: 'company-profile',
        title: 'COMPANY_PROFILE',
        icon: 'users',
        class: 'ml-menu',
        submenu: [],
        hasClaims: ['company_profile_edit'],
      },
    ],
  },
  {
    path: '',
    title: 'LOGS',
    icon: 'file-text',
    class: 'menu-toggle',
    hasClaims: [
      'login_audit_list',
      'system_logs_list',
    ],
    submenu: [
      {
        path: 'login-audit',
        title: 'LOGIN_AUDIT',
        icon: 'key',
        class: 'ml-menu',
        submenu: [],
        hasClaims: ['login_audit_list'],
      },
      {
        path: 'logs',
        title: 'ERROR_LOGS',
        icon: '',
        class: 'ml-menu',
        submenu: [],
        hasClaims: ['system_logs_list'],
      },
    ],
  },
];
