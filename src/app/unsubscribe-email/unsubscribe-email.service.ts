import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { catchError, Observable } from 'rxjs';
import { UnSubscribeEmail } from './model/unSubscribeEmail';
import { UnSubscribeEmailResourceParameter } from './model/unSubscribeEmailResourceParameter';

@Injectable({
    providedIn: 'root'
})

export class UnsubscribeEmailService {
    private httpClient = inject(HttpClient);
    private commonHttpErrorService = inject(CommonHttpErrorService);

    getAllUnsubscribeReasons(): Observable<string[] | CommonError> {
        const url = 'UnsubscribeEmail';
        return this.httpClient
            .get<string[]>(url)
            .pipe(catchError(this.commonHttpErrorService.handleError));
    }

    addUnsubscribeReason(reason: string, email: string): Observable<string | CommonError> {
        const url = 'UnsubscribeEmail';
        return this.httpClient
            .post<string>(url, { reason, email })
            .pipe(catchError(this.commonHttpErrorService.handleError));
    }

    deleteEmail(emailId: string): Observable<void | CommonError> {
        const url = `UnsubscribeEmail/${emailId}`;
        return this.httpClient
            .delete<void>(url)
            .pipe(catchError(this.commonHttpErrorService.handleError));
    }

    getUnsubscribeEmails(resource: UnSubscribeEmailResourceParameter): Observable<HttpResponse<UnSubscribeEmail[]>> {
        const url = 'UnsubscribeEmail';
        const customParams = new HttpParams()
            .set('OrderBy', resource.orderBy)
            .set('PageSize', resource.pageSize)
            .set('Skip', resource.skip)
            .set('Email', resource.email)
        return this.httpClient
            .get<UnSubscribeEmail[]>(url, {
                params: customParams,
                observe: 'response'
            })
    }
}
