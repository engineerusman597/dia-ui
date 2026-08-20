import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';

import { FooterComponent } from './footer/footer.component';

import { CommonDialogService } from './common-dialog/common-dialog.service';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '@shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { LoadingIndicatorModule } from '@shared/loading-indicator/loading-indicator.module';
import { CommonDialogComponent } from './common-dialog/common-dialog.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { SidebarComponent } from './sidebar/sidebar.component';
import { WINDOW_PROVIDERS } from './services/window.service';
import { HeaderComponent } from './header/header.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PipesModule } from '@shared/pipes/pipes.module';
import { SecurityService } from './security/security.service';
import { initializeApp } from './security/initialize-app-factory';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    CommonDialogComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    SharedModule,
    MatTooltipModule,
    LoadingIndicatorModule,
    NgScrollbar,
    FeatherModule.pick(allIcons),
    PipesModule,
    MatIconModule
  ],
  exports: [
    LayoutComponent
  ],
  providers: [
    CommonDialogService,
    WINDOW_PROVIDERS,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SecurityService],
      multi: true,
    },
  ]
})
export class CoreModule { }
