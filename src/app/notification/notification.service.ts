import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserNotification } from '@core/domain-classes/notification';
import { ServiceResponse } from '@core/domain-classes/service-response';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService) { }

  getNotification(): Observable<UserNotification[] | CommonError> {
    const url = `UserNotification/notification`;
    return this.httpClient.get<UserNotification[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getNotifications(resource): Observable<HttpResponse<UserNotification[]> | CommonError> {
    const url = `UserNotification/notifications`;
    const customParams = new HttpParams()
      .set('Fields', resource.fields)
      .set('OrderBy', resource.orderBy)
      .set('PageSize', resource.pageSize.toString())
      .set('Skip', resource.skip.toString())
      .set('SearchQuery', resource.searchQuery)
      .set('name', resource.name)
      .set('id', resource.id.toString())
      .set('createdBy', resource.createdBy.toString())

    return this.httpClient.get<UserNotification[]>(url, {
      params: customParams,
      observe: 'response'
    }).pipe(catchError(this.commonHttpErrorService.handleError));
  }

  markAsRead(id: string) {
    const url = `UserNotification/MarkAsRead`;
    return this.httpClient.post<void>(url, { id })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  markAllAsRead() {
    const url = `UserNotification/MarkAllAsRead`;
    return this.httpClient.post<void>(url, null)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

}
