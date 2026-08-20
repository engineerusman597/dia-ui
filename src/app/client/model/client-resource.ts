import { ResourceParameter } from "@core/domain-classes/resource-parameter";

export interface ClientResource extends ResourceParameter {
  email?: string;
  policyNumber?: string;
  countryOfOrigin?: string;
  countryOfResidence?: string;
  identityProofStatus: number | null;
  addressProofStatus: number | null;
  createdDateFrom?: Date | null;
  createdDateTo?: Date | null;
  assignTo?: string;
}