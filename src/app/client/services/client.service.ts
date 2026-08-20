import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IdName } from '@core/domain-classes/id-name';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { SecurityService } from '@core/security/security.service';
import { Client } from '../model/client';
import { ClientResource } from '../model/client-resource';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService,
    private securityService: SecurityService
  ) { }

  getClients(
    resource: ClientResource
  ): Observable<HttpResponse<Client[]> | CommonError> {
    const url = 'Client';
    const customParams = new HttpParams()
      .set('OrderBy', resource.orderBy)
      .set('PageSize', resource.pageSize)
      .set('Skip', resource.skip)
      .set('Name', resource.name ?? '')
      .set('PolicyNumber', resource.policyNumber ?? '')
      .set('CountryOfOrigin', resource.countryOfOrigin ?? '')
      .set('CountryOfResidence', resource.countryOfResidence ?? '')
      .set('IdentityProofStatus', resource.identityProofStatus !== null && resource.identityProofStatus !== undefined ? resource.identityProofStatus.toString() : '')
      .set('AddressProofStatus', resource.addressProofStatus !== null && resource.addressProofStatus !== undefined ? resource.addressProofStatus.toString() : '')
      .set('Email', resource.email ?? '')
      .set('FromDate', resource.createdDateFrom ? resource.createdDateFrom.toLocaleDateString() : '')
      .set('ToDate', resource.createdDateTo ? resource.createdDateTo.toLocaleDateString() : '')
      .set('AssignToId', resource.assignTo ?? '');
    return this.httpClient
      .get<Client[]>(url, {
        params: customParams,
        observe: 'response',
      }).pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getClientsApprovalPending(
    resource: ClientResource
  ): Observable<HttpResponse<Client[]> | CommonError> {
    const url = 'Client/approvalPendingDocuments';
    const customParams = new HttpParams()
      .set('OrderBy', resource.orderBy)
      .set('PageSize', resource.pageSize)
      .set('Skip', resource.skip)
      .set('Name', resource.name ?? '')
      .set('Email', resource.email ?? '')
      .set('PolicyNumber', resource.policyNumber ?? '')
      .set('CountryOfOrigin', resource.countryOfOrigin ?? '')
      .set('CountryOfResidence', resource.countryOfResidence ?? '')
      .set('AssignToId', resource.assignTo ?? '');
    return this.httpClient
      .get<Client[]>(url, {
        params: customParams,
        observe: 'response',
      }).pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getClientsRejectedDocument(
    resource: ClientResource
  ): Observable<HttpResponse<Client[]> | CommonError> {
    const url = 'Client/rejectedDocument';
    const customParams = new HttpParams()
      .set('OrderBy', resource.orderBy)
      .set('PageSize', resource.pageSize)
      .set('Skip', resource.skip)
      .set('Name', resource.name ?? '')
      .set('Email', resource.email ?? '')
      .set('PolicyNumber', resource.policyNumber ?? '')
      .set('CountryOfOrigin', resource.countryOfOrigin ?? '')
      .set('CountryOfResidence', resource.countryOfResidence ?? '')
      .set('AssignToId', resource.assignTo ?? '');
    return this.httpClient
      .get<Client[]>(url, {
        params: customParams,
        observe: 'response',
      }).pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getClientsForDropDown(query: string): Observable<HttpResponse<IdName[]>> {
    const url = 'Client/Drop-Down';
    const customParams = new HttpParams().set('query', query);
    return this.httpClient.get<IdName[]>(url, {
      params: customParams,
      observe: 'response',
    });
  }

  getClient(id: string): Observable<Client | CommonError> {
    const url = `Client/${id}`;
    return this.httpClient
      .get<Client>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addClient(client: Client): Observable<Client | CommonError> {
    const url = `Client`;
    return this.httpClient
      .post<Client>(url, client)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateClient(client: Client): Observable<Client | CommonError> {
    const url = `Client/${client.id}`;
    return this.httpClient
      .put<Client>(url, client)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteClient(id: string): Observable<Client | CommonError> {
    const url = `Client/${id}`;
    return this.httpClient
      .delete<Client>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  checkPasswordStatus(clientId: string): Observable<{ resetPasswordToken: string, setPasswordFlag: boolean } | CommonError> {
    const url = `Client/password-check/${clientId}`;
    return this.httpClient
      .get<{ resetPasswordToken: string, setPasswordFlag: boolean }>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  setClientPassword(clientId: string, password: string): Observable<{ bearerToken: string, clientId: string, userType: number } | CommonError> {
    const url = 'Client/reset-password';
    return this.httpClient
      .post<{ bearerToken: string, clientId: string, userType: number }>(url, { restpasswordToken: clientId, password: password })
      .pipe(
        tap((resp) => {
          this.securityService.setBearerToken(resp.bearerToken);
        })
        , catchError(this.commonHttpErrorService.handleError));

  }

  sendForgotPasswordEmail(email: string): Observable<void | CommonError> {
    return this.httpClient
      .put<void>('Client/forgot-password', { email })
      .pipe(catchError(this.commonHttpErrorService.handleError)
      );
  }

  getCountriesForDropDown(query: string): Observable<HttpResponse<IdName[]>> {
    const url = 'Country/drop-down';
    const customParams = new HttpParams().set('query', query);
    return this.httpClient.get<IdName[]>(url, {
      params: customParams,
      observe: 'response',
    });
  }

  getClientInfo(id: string): Observable<Client | CommonError> {
    const url = `ClientDocument/client-info/${id}`;
    return this.httpClient
      .get<Client>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getClientInfoByPolicy(policyNumber: string): Observable<Client | CommonError> {
    const params = new HttpParams().set('policyNo', policyNumber);

    return this.httpClient
      .get<Client>('ClientDocument/client-info/policy', { params })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateClientAddress(clientId: string, newAddress: string): Observable<Client | CommonError> {
    const url = `client/update-address/${clientId}`;
    return this.httpClient
      .put<Client>(url, { clientId, physicalAddress: newAddress })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  uploadDocument(file: Blob): Observable<void | CommonError> {
    const url = 'ClientDocument/client-upload';
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient
      .post<void>(url, formData)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  downloadClientsCsv(id: string): Observable<Blob | CommonError> {
    const url = `ExportClient/${id}`;
    return this.httpClient
      .get(url, { responseType: 'blob' })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getSupportUsersForDropDown(query: string, isDropDown?: boolean, isIncluded?: boolean): Observable<HttpResponse<IdName[]>> {
    const url = 'Client/support-team/drop-down';
    let customParams = new HttpParams()
      .set('query', query);
    if (isDropDown) {
      customParams = customParams.set('isDropDown', isDropDown.toString());
    }
    if (isIncluded) {
      customParams = customParams.set('isIncluded', isIncluded.toString());
    }
    return this.httpClient.get<IdName[]>(url, {
      params: customParams,
      observe: 'response',
    });
  }

  getAssignClientsForDropDown(assignToId: string, query: string): Observable<HttpResponse<Client[]>> {
    const url = 'Client/assign-client/drop-down';
    const customParams = new HttpParams()
      .set('AssignToId', assignToId ?? '')
      .set('Query', query ?? '');
    return this.httpClient.get<Client[]>(url, {
      params: customParams,
      observe: 'response',
    });
  }

  assignClients(assignToId: string, clientIds: string[]): Observable<void | CommonError> {
    const url = 'Client/assign-to-support-team';
    const payload = {
      assignToId: assignToId ?? '',
      clientIds: clientIds ?? []
    };

    return this.httpClient
      .post<void>(url, payload)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  transferClients(fromAssignToId: string, toAssignToId: string): Observable<void | CommonError> {
    const url = 'Client/transfer-clients';
    const payload = {
      fromAssignToId: fromAssignToId ?? '',
      toAssignToId: toAssignToId ?? '',
    };

    return this.httpClient
      .post<void>(url, payload)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getSupportUsersForTransferDropDown(query: string, isIncluded?: boolean): Observable<HttpResponse<IdName[]>> {
    const url = 'Client/support-team/transfer-drop-down';
    let customParams = new HttpParams().set('query', query);
    if (isIncluded) {
      customParams = customParams.set('isIncluded', isIncluded.toString());
    }
    return this.httpClient.get<IdName[]>(url, {
      params: customParams,
      observe: 'response',
    });
  }
}
