import { ResourceParameter } from './resource-parameter';

export class UserResource extends ResourceParameter {
  email: string = '';
  first_name: string = '';
  last_name: string = '';
  phone_number: string = '';
  isActive: boolean = true;
}
