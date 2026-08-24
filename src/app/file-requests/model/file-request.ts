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
    reminderType?: ReminderType;
    isAutoReminder?: boolean;
    password?: string;
}

export enum ReminderType {
    KycVerification = 0,
    BothPendingRejected = 1,
    IdPendingRejected = 2,
    PoaPendingRejected = 3
}