import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { User } from '@core/domain-classes/user';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class UserDetailResolverService  {
    constructor(private userService: UserService) { }
    resolve(
        route: ActivatedRouteSnapshot
    ): Observable<User> {
        const id = route.paramMap.get('id');
        return this.userService.getUser(id ?? '') as Observable<User>;
    }
}
