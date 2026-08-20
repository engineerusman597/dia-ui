import { Pipe, PipeTransform } from '@angular/core';
import { RequestStatus } from '../../../app/client/model/request-status';

@Pipe({
  name: 'requestStatus'
})
export class RequestStatusPipe implements PipeTransform {
  transform(value: RequestStatus | number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    const v = typeof value === 'string' ? Number(value) : (value as number);
    switch (v) {
      case RequestStatus.Pending:
        return 'Pending';
      case RequestStatus.Uploaded:
        return 'Uploaded';
      case RequestStatus.Rejected:
        return 'Rejected';
      case RequestStatus.Approved:
        return 'Approved';
      default:
        return String(value);
    }
  }
}
