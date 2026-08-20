export class EmailSMTPSetting {
    id?: string;
    host: string;
    userName: string;
    password: string;
    encryptionType: boolean;
    port: number;
    isDefault: boolean;
    fromEmail: string;
    fromName: string;
}
