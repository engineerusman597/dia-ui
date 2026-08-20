import { Pipe, PipeTransform } from '@angular/core';
import { EmailStatus } from '../file-requests/model/email-status';

@Pipe({
  name: 'emailStatus'
})
export class EmailStatusPipe implements PipeTransform {
  transform(value: EmailStatus | number): string {
    switch (value) {
      case EmailStatus.Pending:
        return 'Pending';
      case EmailStatus.Failed:
        return 'Failed';
      case EmailStatus.Success:
        return 'Success';
      default:
        return '';
    }
  }
}
