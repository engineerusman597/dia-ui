export interface ClientReportRow {
    id: string;
    name: string;
    email: string;
    policyNumber: string;
    createdDate?: string;
    isDocumentsFullyApproved?: boolean;
}