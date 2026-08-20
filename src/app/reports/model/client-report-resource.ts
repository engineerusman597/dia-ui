import { ResourceParameter } from '@core/domain-classes/resource-parameter';

export interface ClientReportResource extends ResourceParameter {
  email: string;
  policyNumber: string;
  createdDateFrom: Date | null;
  createdDateTo: Date | null;
  countryOfOrigin: string;
  countryOfResidence: string;
  identityProofStatus: number | null;
  addressProofStatus: number | null;
  isDocumentsFullyApproved: boolean | null;
  assignTo: string;
}
