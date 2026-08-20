import { Injectable } from '@angular/core';
import {
    Router,
    CanActivate,
} from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from './security.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })

export class ClientAuthGuard implements CanActivate {
    constructor(
        private securityService: SecurityService,
        private router: Router,
        private toastr: ToastrService,
    ) { }

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.securityService.isLogin()) {
            if (
                this.securityService.loginHasClaim('UserType') &&
                this.securityService.Claims['UserType'] === 'Client'
            ) {
                return true;
            } else {
                this.toastr.error("You don't have right to access this page");
                this.router.navigate(['/login']);
                return false;
            }
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}
