import { ResourceParameter } from "@core/domain-classes/resource-parameter";

    

export interface FileRequestParameters extends ResourceParameter {
   status: number | null;
   email?: string;
   name?: string;
   identityProofStatus?: number | null;
   addressProofStatus?: number | null;
   policyNumber?: string;
}