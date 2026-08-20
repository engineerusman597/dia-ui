import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { ClientReportMode } from './model/client-report-mode';
import { ClientReportResource } from './model/client-report-resource';
import { ClientReportRow } from './model/client-report';
import { ClientStatusSummary } from './model/client-status-summary';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { CommonError } from '@core/error-handler/common-error';

@Injectable({
    providedIn: 'root',
})
export class ReportsService {
    constructor(
        private httpClient: HttpClient,
        private commonHttpErrorService: CommonHttpErrorService
    ) { }

    getClientDocumentStatusSummary(
        fromDate: Date | null,
        toDate: Date | null
    ): Observable<ClientStatusSummary | CommonError> {
        let params = new HttpParams();

        if (fromDate) {
            params = params.set('FromDate', fromDate.toLocaleDateString());
        }

        if (toDate) {
            params = params.set('ToDate', toDate.toLocaleDateString());
        }

        return this.httpClient.get<ClientStatusSummary>(
            'KycReport/client-document-status-summary',
            { params }
        ).pipe(catchError(this.commonHttpErrorService.handleError));;
    }

    getTotalClientCount(): Observable<{ totalClientCount: number }> {
        return this.httpClient
            .get<{ totalClientCount: number }>('dashboard/total-count');
    }

    getDocumentApprovalStatus(): Observable<{ completedPercentage: number; pendingPercentage: number }> {
        return this.httpClient
            .get<{ completedPercentage: number; pendingPercentage: number }>('KycReport/document-approval-status');
    }

    getLastUploadedDate(): Observable<{ lastUploadedFileDate: string | null }> {
        return this.httpClient
            .get<{ lastUploadedFileDate: string | null }>('KycReport/last-uploaded-date');
    }

    getReportClients(
        mode: ClientReportMode,
        resource: ClientReportResource
    ): Observable<HttpResponse<ClientReportRow[]> | CommonError> {
        const endpoint = mode === ClientReportMode.Total || mode === ClientReportMode.View || mode === ClientReportMode.Assigned ? 'Client' : 'KycReport';
        let params = new HttpParams()
            .set('OrderBy', resource.orderBy)
            .set('PageSize', resource.pageSize)
            .set('Skip', resource.skip)
            .set('Name', resource.name ?? '')
            .set('PolicyNumber', resource.policyNumber ?? '')
            .set('CountryOfOrigin', resource.countryOfOrigin ?? '')
            .set('CountryOfResidence', resource.countryOfResidence ?? '')
            .set('IdentityProofStatus', resource.identityProofStatus ?? '')
            .set('AddressProofStatus', resource.addressProofStatus ?? '')
            .set('Email', resource.email ?? '')
            .set('FromDate', resource.createdDateFrom ? resource.createdDateFrom.toLocaleDateString() : '')
            .set('ToDate', resource.createdDateTo ? resource.createdDateTo.toLocaleDateString() : '')
            .set('AssignToId', resource.assignTo ?? '');
        if (mode !== ClientReportMode.Total) {
            params = params.set('IsDocumentsFullyApproved',
                resource.isDocumentsFullyApproved !== null ?
                    resource.isDocumentsFullyApproved : '');
        }

        return this.httpClient.get<ClientReportRow[]>(endpoint, {
            params,
            observe: 'response',
        }).pipe(catchError(this.commonHttpErrorService.handleError));
    }

    downloadCsv(mode: ClientReportMode, fromDate?: string, toDate?: string, assignedToId?: string): Observable<HttpResponse<Blob> | CommonError> {
        const endpoint = this.getCsvEndpoint(mode, assignedToId);
        let params = new HttpParams();

        if (fromDate) {
            params = params.set('FromDate', fromDate);
        }
        if (toDate) {
            params = params.set('ToDate', toDate);
        }

        return this.httpClient.get(endpoint, {
            params,
            observe: 'response',
            responseType: 'blob',
        }).pipe(catchError(this.commonHttpErrorService.handleError));
    }

    private getCsvEndpoint(mode: ClientReportMode, assignedToId?: string): string {
        switch (mode) {
            case ClientReportMode.Completed:
                return 'ExportClient/documents-approved-clients';

            case ClientReportMode.Pending:
                return 'ExportClient/documents-not-approved-clients';

            case ClientReportMode.View:
                return 'ExportClient/by-created-date';

            case ClientReportMode.Assigned:
                return `ExportClient/assigned-clients/${assignedToId ?? ''}`;

            default:
                return 'ExportClient/all-clients';
        }
    }
}
