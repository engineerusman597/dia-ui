import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './truncate.pipe';
import { UTCToLocalTime } from './utc-to-localtime.pipe';
import { GenderPipe } from './gender.pipe';
import { DocumentTypePipe } from './document-type.pipe';
import { RequestStatusPipe } from './request-status.pipe';
import { EmailStatusPipe } from 'src/app/file-requests/email-status.pipe';

@NgModule({
  declarations: [TruncatePipe, UTCToLocalTime, GenderPipe , DocumentTypePipe, RequestStatusPipe , EmailStatusPipe],
  imports: [CommonModule],
  exports: [TruncatePipe, UTCToLocalTime, GenderPipe , DocumentTypePipe, RequestStatusPipe, EmailStatusPipe],
})
export class PipesModule { }
