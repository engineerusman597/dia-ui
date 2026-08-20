import { Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { ClientResolver } from './client.resolver';

export const CLIENT_ROUTES: Routes = [
  {
    path: 'list',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./client-list/client-list').then(
        (c) => c.ClientList
      ),
  },
  {
    path: 'manage',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./manage-client/manage-client').then(
        (m) => m.ManageClient
      ),
  },
  {
    path: 'manage/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./manage-client/manage-client').then(
        (m) => m.ManageClient
      ),
    resolve: {
      client: ClientResolver,
    },
  }
];
