import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  Route,
} from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from './security.service';


@Injectable({ providedIn: 'root' })
export class SendRequestGuard {
  constructor(
    private securityService: SecurityService,
    private router: Router,

  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.securityService.isLogin()) {
      return true;
    } else {
      this.router.navigate(['/login', { returnUrl: state.url }]);
      return false;
    }
  }

}
