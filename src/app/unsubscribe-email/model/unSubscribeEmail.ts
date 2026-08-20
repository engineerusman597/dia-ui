export interface UnSubscribeEmail {
    id: string;
    email: string;
    ipAddress: string;
    createdOn: Date;
    reason: string;
    isOtherReason: boolean;
}