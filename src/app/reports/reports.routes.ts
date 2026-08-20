import { Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./client-reports/client-reports.component').then(
        (m) => m.ClientReportsComponent
      ),
  },
  {
    path: 'client-reports',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./client-reports/client-reports.component').then(
        (m) => m.ClientReportsComponent
      ),
  },
];
