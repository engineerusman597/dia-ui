import { RequestStatus } from "./request-status";
import { DocumentType } from "./document-type";
import { SafeResourceUrl } from "@angular/platform-browser";

export interface ClientDocument {
    id?: string; // Guid -> string
    name?: string;
    description?: string;
    url?: string;
    documentType: DocumentType;
    clientId: string;
    extension?: string;
    documentStatus?: RequestStatus;
    file?: File; // This property is used only for file uploads and is not sent to the backend
    createdDate?: Date | string; // ISO date string
    fileBytes?: string; // Object URL or data URL for preview; not sent to the backend
    safeFileUrl?: SafeResourceUrl | null; // Used for displaying PDFs securely in the frontend, not sent to backend
    expiryDate?: Date | null; // ISO date string, used for ID documents
    isPdf?: boolean; // Flag to indicate if the document is a PDF, used for frontend display logic
    isLoadingFile?: boolean; // The file content is fetched separately from the document list
    fileLoadFailed?: boolean;
    issueOrBillDate?: Date | null; // ISO date string, used for address proof documents
    statusChangedDate?: Date | string | null; // When it was last approved or rejected
    statusChangedByUserId?: string | null;
    statusChangedByName?: string | null;
    uploadedByUserId?: string | null;
    uploadedByName?: string | null;
    uploadedDate?: Date | string; // Additional proofs carry this instead of createdDate
    isAdditionalProof?: boolean; // Additional proofs live in their own table
}

export enum DocumentAuditAction {
    Uploaded = 0,
    Approved = 1,
    Rejected = 2,
    CategoryChanged = 3,
    StatusChanged = 4,
    Deleted = 5,
}

export interface ClientDocumentAudit {
    id: string;
    clientDocumentId?: string | null;
    additionalProofId?: string | null;
    clientId: string;
    action: DocumentAuditAction;
    documentName?: string;
    fromStatus?: RequestStatus | null;
    toStatus?: RequestStatus | null;
    fromDocumentType?: DocumentType | null;
    toDocumentType?: DocumentType | null;
    changedByUserId: string;
    changedByName?: string;
    changedDate: Date | string;
    note?: string;
}