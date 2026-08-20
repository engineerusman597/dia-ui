import { Injectable } from '@angular/core';
import {
  Resolve
} from '@angular/router';
import { User } from '@core/domain-classes/user';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';

@Injectable({ providedIn: 'root' })
export class MyProfileResolverService implements Resolve<User> {
  constructor(private userService: UserService) {}
  resolve(): Observable<User> {
    return this.userService.getUserProfile() as Observable<User>;
  }
}
