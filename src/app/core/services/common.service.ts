import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '@core/domain-classes/user';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { ServiceResponse } from '@core/domain-classes/service-response';

@Injectable({ providedIn: 'root' })
export class CommonService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService
  ) { }
  private _IsSmtpConfigured$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public get IsSmtpConfigured(): Observable<boolean> {
    return this._IsSmtpConfigured$.asObservable();
  }


  private _sideMenuStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public get sideMenuStatus$(): Observable<boolean> {
    return this._sideMenuStatus$.asObservable();
  }
  public setSideMenuStatus(flag: boolean) {
    this._sideMenuStatus$.next(flag);
  }


  setIsSmtpConfigured(value: boolean) {
    this._IsSmtpConfigured$.next(value);
  }

  getAllUsers(): Observable<User[] | CommonError> {
    const url = `user/getAllUsers`;
    return this.httpClient.get<User[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getUsersForDropdown(): Observable<User[] | CommonError> {
    const url = `user/dropdown`;
    return this.httpClient
      .get<User[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }


  checkEmailSMTPSetting(): Observable<ServiceResponse<boolean> | CommonError> {
    const url = 'EmailSMTPSetting/check';
    return this.httpClient.get<ServiceResponse<boolean>>(url)
      .pipe(
        shareReplay(1),
        tap((response) => { this._IsSmtpConfigured$.next(response.data); }),
        catchError(this.commonHttpErrorService.handleError)
      );
  }
}
