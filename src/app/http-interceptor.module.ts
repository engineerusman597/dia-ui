import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '@environments/environment';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '@core/services/translation.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  /**
   *
   */
  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    var token = localStorage.getItem('bearerToken');
    const baseUrl = environment.apiUrl;
    if (req.url.lastIndexOf('i18n') > -1) {
      return next.handle(req);
    }
    const url = req.url.lastIndexOf('api') > -1 ? req.url : 'api/' + req.url;
    if (token) {
      const newReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token),
        url: `${baseUrl}${url}`,
      });
      return next.handle(newReq).pipe(
        tap(
          () => {},
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                this.router.navigate(['login']);
              } else if (err.status === 403) {
                this.toastrService.error("You don't have right to access this page");
              } else if (err.error && err.error.length >= 0) {
                this.toastrService.error(err.error[0]);
              } else if (err.error && err.error?.messages?.length > 0) {
                this.toastrService.error(err?.error?.messages[0]);
              }
            }
          }
        )
      );
    } else {
      const newReq = req.clone({
        url: `${baseUrl}${url}`,
      });
      return next.handle(newReq).pipe(
        tap(
          () => {},
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                this.router.navigate(['login']);
              }
              if (err.status === 403) {
                this.router.navigate(['login']);
              }
              if (err.status === 409) {
                this.toastrService.error(err.error.messages[0]);
              }
            }
          }
        )
      );
    }
  }
}

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
  ],
})
export class HttpInterceptorModule {}
