import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SecurityService } from './security.service';
import { CompanyProfile } from 'src/app/company-profile/company-profile';

export function initializeApp(securityService: SecurityService): () => Promise<void> {
    return () => new Promise<void>((resolve) => {
        securityService.getCompanyProfile().pipe(
            tap((companyProfile: CompanyProfile) => {
                securityService.setCompany(companyProfile);
            })
        ).subscribe(() => {
            resolve();
        });
    });
}

