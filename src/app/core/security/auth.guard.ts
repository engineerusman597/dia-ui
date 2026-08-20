import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { SecurityService } from './security.service';

@Injectable({ providedIn: 'root' })

export class AuthGuard {
  constructor(
    private securityService: SecurityService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // Check if user is logged in (Token exists in local storage)
    if (this.securityService.isLogin()) {
      if (this.securityService.loginHasClaim('UserType') && this.securityService.Claims['UserType'] === 'SuperAdmin'.toString()) {
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

  canActivateChild(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.securityService.isLogin()) {
      if (this.securityService.loginHasClaim('UserType') && this.securityService.Claims['UserType'] === 'SuperAdmin'.toString()) {
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


  canLoad(): boolean {
    if (this.securityService.isLogin()) {
      if (this.securityService.loginHasClaim('UserType') && this.securityService.Claims['UserType'] === 'SuperAdmin'.toString()) {
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
