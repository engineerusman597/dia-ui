import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { AppSetting } from '@core/domain-classes/app-setting';
import { CommonError } from '@core/error-handler/common-error';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AppSettingService {

  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService) { }

  updateAppSetting(appSetting: AppSetting): Observable<AppSetting | CommonError> {
    const url = `appsetting/${appSetting.id}`;
    return this.httpClient.put<AppSetting>(url, appSetting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addAppSetting(appSetting: AppSetting): Observable<AppSetting | CommonError> {
    const url = `appsetting`;
    return this.httpClient.post<AppSetting>(url, appSetting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteAppSetting(id: string): Observable<void | CommonError> {
    const url = `appsetting/${id}`;
    return this.httpClient.delete<void>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getAppSetting(id: string): Observable<AppSetting | CommonError> {
    const url = `appsetting/${id}`;
    return this.httpClient.get<AppSetting>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getAppSettings(): Observable<AppSetting[] | CommonError> {
    const url = `appsetting`;
    return this.httpClient.get<AppSetting[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getAppSettingByKey(key: string): Observable<AppSetting | CommonError> {
    const url = `appsetting/key/${key}`;
    return this.httpClient.get<AppSetting>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }


}
