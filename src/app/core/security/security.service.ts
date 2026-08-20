import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { UserAuth } from '../domain-classes/user-auth';
import { CommonHttpErrorService } from '../error-handler/common-http-error.service';
import { CommonError } from '../error-handler/common-error';
import { User } from '@core/domain-classes/user';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CompanyProfile } from 'src/app/company-profile/company-profile';
import { UserType } from '@core/domain-classes/user-type';

interface RefreshTokenResponse {
  bearerToken: string;
}

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly refreshTokenTimeoutDuration = 11; // 11 minutes

  refreshTimer: any;

  securityObject: UserAuth = new UserAuth();
  private _securityObject$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null
  );

  private companyProfile$: BehaviorSubject<CompanyProfile | null> = new BehaviorSubject<CompanyProfile | null>(null);

  private _claims: { [key: string]: string } | null = null;
  private timeOutRefreshToken: any;

  public get Claims(): { [key: string]: string } {
    if (this._claims) {
      return this._claims;
    }

    const token = localStorage.getItem('bearerToken');
    if (token) {
      this._claims = jwtDecode(token);
    }
    return this._claims || {};
  }

  public get SecurityObject(): Observable<User | null> {
    return this._securityObject$;
  }

  constructor(
    private http: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService,
    private router: Router

  ) { }

  login(entity: User): Observable<UserAuth | CommonError> {
    const url = entity.userType === UserType.Client ? 'Client/login' : 'user/login';
    this.resetSecurityObject();
    return this.http
      .post<UserAuth>(url, entity)
      .pipe(
        tap((resp) => {
          localStorage.setItem('tokenGenerateTime', new Date().toString());
          this.handleSuccessfulAuthentication(resp.bearerToken);
        })
      )
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }


  isLogin(): boolean {
    const authStr = localStorage.getItem('bearerToken');
    if (authStr) return true;
    else return false;
  }

  socialLogin(entity: User): Observable<UserAuth | CommonError> {
    // Initialize security object
    this.resetSecurityObject();
    return this.http
      .post<UserAuth>('SocialLogin/login', entity)
      .pipe(
        tap((resp) => {
          this.handleSuccessfulAuthentication(resp.bearerToken);
        })
      )
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  setBearerToken(token: string): void {
    if (!token) {
     token= localStorage.getItem('bearerToken') ?? '';
    }
    this.handleSuccessfulAuthentication(token);
  }

  initializeSessionTimers(): void {
    if (!this.isLogin()) {
      return;
    }
  }

  logout(): void {
    this.resetSecurityObject();
  }

  resetSecurityObject(): void {
    this.stopSessionTimers();
    localStorage.removeItem('bearerToken');
    this._securityObject$.next(null);
    this._claims = null;
    this.router.navigate(['/login']);
  }

  updateUserProfile(user: User) {
    this._securityObject$.next(user);
  }

  // This method can be called a couple of different ways
  // *hasClaim="'claimType'"  // Assumes claimValue is true
  // *hasClaim="['claimType1','claimType2','claimType3']"
  // tslint:disable-next-line: typedef
  hasClaim(claimType: any): boolean {
    let ret = false;
    // See if an array of values was passed in.
    if (typeof claimType === 'string') {
      ret = this.isClaimValid(claimType);
    } else {
      const claims: string[] = claimType;
      if (claims) {
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < claims.length; index++) {
          ret = this.isClaimValid(claims[index]);
          // If one is successful, then let them in
          if (ret) {
            break;
          }
        }
      }
    }
    return true;
  }

  loginHasClaim(claimType: any): boolean {
    let ret = false;
    // See if an array of values was passed in.
    if (typeof claimType === 'string') {
      ret = this.isClaimValid(claimType);
    } else {
      const claims: string[] = claimType;
      if (claims) {
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < claims.length; index++) {
          ret = this.isClaimValid(claims[index]);
          // If one is successful, then let them in
          if (ret) {
            break;
          }
        }
      }
    }
    return ret;
  }

  setCompany(companyProfile: CompanyProfile) {
    this.companyProfile$.next(JSON.parse(JSON.stringify(companyProfile)));
  }

  public get companyProfile(): Observable<CompanyProfile | null> {
    return this.companyProfile$.asObservable();
  }

  getCompanyProfile(): Observable<CompanyProfile> {
    const url = `companyprofile`;
    return this.http.get<CompanyProfile>(url);
  }

  private isClaimValid(claimType: string): boolean {
    let ret = false;
    claimType = claimType;
    // Attempt to find the claim
    if (Object.keys(this.Claims).indexOf(claimType) > -1) {
      ret = true;
    }
    return ret;
  }

  private handleSuccessfulAuthentication(token: string): void {
    if (!token) {
      return;
    }
    localStorage.setItem('bearerToken', token);
    this._claims = token ? jwtDecode(token) : null;
      this.initializeSessionTimers();
      this.stopSessionTimers();
      this.startRefreshTokenTimer();

  }

    private startRefreshTokenTimer() {
    const currentDate = new Date();
    const tokenTimeStr = localStorage.getItem('tokenGenerateTime');
    const tokenTime = tokenTimeStr ? new Date(tokenTimeStr) : new Date();
    const diffInMs = currentDate.getTime() - tokenTime.getTime();
    const diffInMinutes: number = Math.floor(diffInMs / (1000 * 60));
    //Make sure to refresh the token a few seconds before it actually expires (e.g., 1 minute before expiration)
    //if nagative value is returned, it means token is already expired, so refresh immediately
    const fireTimer =  this.refreshTokenTimeoutDuration - diffInMinutes ;
    if (fireTimer <= 0) {
      this.refreshToken().subscribe();
      return;
    }
    // Clear any existing timer
    if (this.refreshTimer)
      clearTimeout(this.refreshTimer);
    // Set timer to refresh the token a few seconds before it actually expires (e.g., 1 minute before expiration)
    const refreshTime = fireTimer * 60 * 1000;
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().subscribe();
    }, refreshTime);
  }

  private refreshToken(): Observable<RefreshTokenResponse | never> {
    const userId = this.Claims['sub'];

    if (!userId) {
      this.logout();
      return EMPTY;
    }

    const refreshTokenEndpoint = `user/refresh-token/${userId}`;

    return this.http.get<RefreshTokenResponse>(refreshTokenEndpoint).pipe(
      tap((resp) => {
        if (resp?.bearerToken) {
          localStorage.setItem('tokenGenerateTime', new Date().toString());
          this.handleSuccessfulAuthentication(resp.bearerToken);
        }
      }),
      catchError(() => {
        this.logout();
        return EMPTY;
      })
    );
  }

  private stopSessionTimers(): void {
    if (this.timeOutRefreshToken) {
      clearTimeout(this.timeOutRefreshToken);
      this.timeOutRefreshToken = null;
    }
  }
}
