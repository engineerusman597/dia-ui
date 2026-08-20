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
    fileBytes?: string; // Base64 string representation of the file content, used for uploads
    safeFileUrl?: SafeResourceUrl | null; // Used for displaying PDFs securely in the frontend, not sent to backend
    expiryDate?: Date | null; // ISO date string, used for ID documents
    isPdf?: boolean; // Flag to indicate if the document is a PDF, used for frontend display logic
    issueOrBillDate?: Date | null; // ISO date string, used for address proof documents
}