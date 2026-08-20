import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { CompanyProfile } from './company-profile';

@Injectable({providedIn: 'root'})
export class CompanyProfileService {
    private commonHttpErrorService = inject(CommonHttpErrorService);
    private httpClient = inject(HttpClient);

   
    updateCompanyProfile(companyProfile: CompanyProfile, logoFile?: File, bannerFile?: File): Observable<CompanyProfile | CommonError> {
        const url = `companyprofile/${companyProfile.id}`;
        const formData = new FormData();

        formData.append('id', companyProfile.id);
        formData.append('name', companyProfile.name);
        
        if (logoFile) {
            formData.append('logoFile', logoFile);
        }
        if (bannerFile) {
            formData.append('bannerFile', bannerFile);
        }
    
        return this.httpClient.post<CompanyProfile>(url, formData)
          .pipe(catchError(this.commonHttpErrorService.handleError));
    }
}