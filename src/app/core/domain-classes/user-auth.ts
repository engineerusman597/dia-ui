import { Claim } from './claim';

export class UserAuth {
  id?: string;
  userName: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phoneNumber: string = '';
  bearerToken: string = '';
  userType: number = 0;
  isAuthenticated: boolean = false;
  claims: Claim[] = [];
}
