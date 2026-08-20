import { ClientDocument } from "./client-documents";
import { Gender } from "./client-gender";
import { RequestStatus } from "./request-status";

export interface Client {
  id: string; // Guid -> string
  name: string;
  relationship: string;
  email: string;
  countryId: string;
  countryOfOrigin?: string;
  policyNumber: string;
  trim: string;
  physicalAddress: string;
  gender: Gender;
  commencementDate?: Date | string; // ISO date string
  premiumPayableTo?: string;
  dateOfBirth?: Date | string; // ISO date string
  clientDocuments?: ClientDocument[];
  identityProofStatus?: RequestStatus;
  addressProofStatus?: RequestStatus;
  policies?: string[]; // Assuming policies is an array of strings, adjust as needed
  additionalProofDtos?: ClientDocument[]; // Adjust type as needed
  proofOfAddressRejecteReason?: string;
  proofOfIdRejectReason?: string;
  hasEmailBeenSent?: boolean; // New field to track if email has been sent
}
