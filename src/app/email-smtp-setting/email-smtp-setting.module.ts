import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailSmtpSettingListComponent } from './email-smtp-setting-list/email-smtp-setting-list.component';
import { EmailSmtpSettingRoutingModule } from './email-smtp-setting-routing.module';
import { MatTableModule } from '@angular/material/table';
import { ManageEmailSmtpSettingComponent } from './manage-email-smtp-setting/manage-email-smtp-setting.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EmailSMTPSettingDetailResolver } from './email-settting-detail.resolver';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    EmailSmtpSettingListComponent,
    ManageEmailSmtpSettingComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    EmailSmtpSettingRoutingModule,
    MatTableModule,
    MatSlideToggleModule,
    FeatherModule,
    MatSelectModule
  ],
  providers: [EmailSMTPSettingDetailResolver]
})
export class EmailSmtpSettingModule { }
