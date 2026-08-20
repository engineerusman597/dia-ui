export interface ClientUploadFile {
  id: string;
  fileName: string;
  failedCount: number;
  status: string;
  successCount: number;
  totalRecords: number;
  uploadedByName: string;
  uploadedDate: number;
}
