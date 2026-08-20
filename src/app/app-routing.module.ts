import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';
import { MyProfileComponent } from './user/my-profile/my-profile.component';
import { MyProfileResolverService } from './user/my-profile/my-profile-resolver';
import { ClientAuthGuard } from '@core/security/client-auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'client-request/:id',
    loadComponent: () =>
      import('./client-request/client-request.component').then(
        (m) => m.ClientRequestComponent
      ),
  },
  {
    path: 'unsubscribe/:token',
    loadComponent: () =>
      import('./unsubscribe-email/unsubscribe-email.component').then(
        (m) => m.UnsubscribeEmailComponent
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'upload-documents/:id',
    canActivate: [ClientAuthGuard],
    loadComponent: () =>
      import('./upload-documents/upload-documents.component').then(
        (m) => m.UploadDocumentsComponent
      ),
  },
  {
    path: 'support',
    loadChildren: () =>
      import('./core/support-layout/support.route').then(
        (m) => m.SUPPORT_ROUTES
      ),
  },
  {
    path: 'set-password/:id',
    loadComponent: () =>
      import('./set-password/set-password.component').then(
        (m) => m.SetPasswordComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    resolve: { profile: MyProfileResolverService },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'my-profile',
        component: MyProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'users',
        canLoad: [AuthGuard],
        loadChildren: () =>
          import('./user/user.module').then((m) => m.UserModule),
      },
      {
        path: 'file-requests',
        canActivate: [AuthGuard],
        loadComponent: () => import('./file-requests/file-requests.component').then(m => m.FileRequestsComponent)
      },
      {
        path: 'login-audit',
        data: { claimType: 'login_audit_list' },
        canLoad: [AuthGuard],
        loadChildren: () =>
          import('./login-audit/login-audit.module').then(
            (m) => m.LoginAuditModule
          ),
      },
      {
        path: 'logs',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./n-log/n-log.module').then((m) => m.NLogModule),
      },
      {
        path: 'notifications',
        canLoad: [AuthGuard],
        loadChildren: () =>
          import('./notification/notification.module').then(
            (m) => m.NotificationModule
          ),
      },
      // {
      //   path: 'email-smtp',
      //   canActivate: [AuthGuard],
      //   loadChildren: () =>
      //     import('./email-smtp-setting/email-smtp-setting.module').then(
      //       (m) => m.EmailSmtpSettingModule
      //     ),
      // },
      {
        path: 'email-template',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./email-template/email-template.module').then(
            (m) => m.EmailTemplateModule
          ),
      },
      // {
      //   path: 'email-send',
      //   canActivate: [AuthGuard],
      //   loadChildren: () =>
      //     import('./email-send/email-send.module').then(
      //       (m) => m.EmailSendModule
      //     ),
      // },
      {
        path: 'company-profile',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./company-profile/company-profile.component').then(
            (m) => m.CompanyProfileComponent
          ),
      },
      {
        path: 'clients',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./client/client-routes').then((m) => m.CLIENT_ROUTES),
      },
      {
        path: 'bulk-upload-clients',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./bulk-upload-clients/bulk-upload-clients.component').then((m) => m.BulkUploadClientsComponent),
      },
      {
        path: 'bulk-assign',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./bulk-assign-clients/bulk-assign-clients.component').then((m) => m.BulkAssignClientsComponent),
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: '**',
        redirectTo: 'login'
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
