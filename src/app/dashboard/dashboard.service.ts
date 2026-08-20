import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { User } from '@core/domain-classes/user';
import { DashboardClient } from './dashboard-client';
import { PendingApprovalCount } from './pending_approval_count';

@Injectable({ providedIn: 'root' })
export class DashboradService {
  constructor(private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService) { }

  getActiveUserCount(): Observable<number | CommonError> {
    const url = `dashboard/GetActiveUserCount`;
    return this.httpClient.get<number>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getInactiveUserCount(): Observable<number | CommonError> {
    const url = `dashboard/GetInactiveUserCount`;
    return this.httpClient.get<number>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getTotalUserCount(): Observable<number | CommonError> {
    const url = `dashboard/GetTotalUserCount`;
    return this.httpClient.get<number>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getTotalClientCount(): Observable<DashboardClient | CommonError> {
    const url = `dashboard/total-count`;
    return this.httpClient.get<DashboardClient>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getApprovedOrPendingClientCount(): Observable<PendingApprovalCount | CommonError> {
    const url = `dashboard/pending-approval-count`;
    return this.httpClient.get<PendingApprovalCount>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
