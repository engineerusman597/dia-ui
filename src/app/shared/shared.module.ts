import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { HasClaimDirective } from './has-claim.directive';
import { PipesModule } from './pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherIconsComponent } from './feather-icons/feather-icons.component';
import { FeatherModule } from 'angular-feather';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxEditorModule } from 'ngx-editor';


@NgModule({
  exports: [
    HasClaimDirective,
    OverlayModule,
    TranslateModule,
    FeatherIconsComponent
  ],
  declarations: [
    HasClaimDirective,
    FeatherIconsComponent
  ],
  imports: [
    CommonModule,
    OverlayModule,
    NgxDocViewerModule,
    PipesModule,
    FeatherModule,
    FormsModule,
    MatTooltipModule,
    TranslateModule,
    FeatherModule,
    MatIconModule,
    MatDialogModule,
    MatIconButton,
    NgxEditorModule
  ]
})
export class SharedModule { }

