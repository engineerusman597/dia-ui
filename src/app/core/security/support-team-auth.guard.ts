import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from './security.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class SupportTeamAuthGuard implements CanActivate {
  constructor(
    private securityService: SecurityService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.securityService.isLogin()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (
      this.securityService.loginHasClaim('UserType') &&
      this.securityService.Claims['UserType'] === 'SupportTeam'
    ) {
      return true;
    }

    this.toastr.error("You don't have right to access this page");
    this.router.navigate(['/login']);
    return false;
  }
}
