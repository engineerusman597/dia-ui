import { Routes } from '@angular/router';
import { SupportTeamAuthGuard } from '@core/security/support-team-auth.guard';
import { SupportLayoutComponent } from './support-layout.component';
import { ClientResolver } from '../../client/client.resolver';

export const SUPPORT_ROUTES: Routes = [
    {
        path: '',
        component: SupportLayoutComponent,
        canActivate: [SupportTeamAuthGuard],
        children: [
            {
                path: 'profile',
                canActivate: [SupportTeamAuthGuard],
                loadComponent: () =>
                    import('../../support-team-profile/support-team-profile.component').then(
                        (m) => m.SupportTeamProfileComponent
                    ),
            },
            {
                path: 'manage-client',
                canActivate: [SupportTeamAuthGuard],
                loadComponent: () =>
                    import('../../support-team-add-client/support-team-add-client.component').then(
                        (m) => m.SupportTeamAddClientComponent
                    ),
            },
            {
                path: 'manage-client/:id',
                canActivate: [SupportTeamAuthGuard],
                loadComponent: () =>
                    import('../../support-team-add-client/support-team-add-client.component').then(
                        (m) => m.SupportTeamAddClientComponent
                    ),
                resolve: { client: ClientResolver }
            },
            {
                path: 'client-list',
                canActivate: [SupportTeamAuthGuard],
                loadComponent: () =>
                    import('../../support-team-client-list/support-team-client-list.component').then(
                        (m) => m.SupportTeamClientListComponent
                    ),
            },
            {
                path: 'upload-document/:id',
                canActivate: [SupportTeamAuthGuard],
                loadComponent: () =>
                    import('../../support-team-upload-document/support-team-upload-document.component').then(
                        (m) => m.SupportTeamUploadDocumentComponent
                    ),
            },
        ],
    },
];
