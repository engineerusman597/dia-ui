export interface FileRequest {
    id: string;
    name: string;
    email: string;
    identityProofStatus: number;
    addressProofStatus: number;
    policyNumber: number;
}

export interface FileRequestResponse {
    clientIds: string[];
    isAll: boolean;
}