import { UserAllowedIP } from "./user-allowed-Ip";
import { UserClaim } from "./user-claim";
import { UserRoles } from "./user-roles";

export interface User {
  id?: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  phoneNumber?: string;
  isActive?: boolean;
  address?: string;
  profilePhoto?: string;
  userRoles?: UserRoles[];
  userClaims?: UserClaim[];
  userAllowedIPs?: UserAllowedIP[];
  userType?: number;
}
