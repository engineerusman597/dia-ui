import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { FileRequestParameters } from './model/file.request-parameters';
import { catchError, Observable } from 'rxjs';
import { FileRequest, FileRequestResponse } from './model/file-request';
import { CommonError } from '@core/error-handler/common-error';

@Injectable({
  providedIn: 'root'
})
export class FileRequestsService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService
  ) { }

  getAllFileRequests(resource: FileRequestParameters): Observable<HttpResponse<FileRequest[]> | CommonError> {
    const url = 'FileRequest';
    const customParams = new HttpParams()
      .set('OrderBy', resource.orderBy)
      .set('PageSize', resource.pageSize)
      .set('Skip', resource.skip)
      .set('Name', resource.name || '')
      .set('Email', resource.email ?? '')
      .set('PolicyNumber', resource.policyNumber ?? '')
      .set('Status', resource.status !== null && resource.status !== undefined ? resource.status.toString() : '')
      .set('IdentityProofStatus', resource.identityProofStatus !== null && resource.identityProofStatus !== undefined ? resource.identityProofStatus.toString() : '')
      .set('AddressProofStatus', resource.addressProofStatus !== null && resource.addressProofStatus !== undefined ? resource.addressProofStatus.toString() : '');
    return this.httpClient
      .get<FileRequest[]>(url, {
        params: customParams,
        observe: 'response'
      })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateFileRequest(fileRequest: FileRequestResponse): Observable<void | CommonError> {
    const url = 'FileRequest';
    return this.httpClient
      .post<void>(url, fileRequest)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
