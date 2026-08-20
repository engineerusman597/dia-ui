import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientDocument } from '../model/client-documents';
import { VerifyDocument } from 'src/app/client/model/verify-document';

@Injectable({ providedIn: 'root' })
export class FileRequestService {
  constructor(private http: HttpClient) { }

  uploadFile(fileForm: ClientDocument, isAdmin: boolean): Observable<any> {
    // Expecting backend endpoint to be '/file/upload' (fix typo)
    const url = isAdmin ? 'ClientDocument/admin-upload' : 'ClientDocument/client-upload';
    const form = new FormData();
    if (fileForm.id) form.append('Id', fileForm.id);
    if (fileForm.clientId) form.append('ClientId', fileForm.clientId);
    if (fileForm.documentType !== undefined && fileForm.documentType !== null) {
      form.append('DocumentType', fileForm.documentType.toString());
    }
    if (fileForm.expiryDate) {
      const expiryDate = new Date(fileForm.expiryDate);
      form.append('ExpiryDate', expiryDate.toISOString());
    }
    if (fileForm.issueOrBillDate) {
      const issueOrBillDate = new Date(fileForm.issueOrBillDate);
      form.append('ExpiryDate', issueOrBillDate.toISOString());
    }
    if (fileForm.file) {
      // append file with original filename when available
      form.append('file', fileForm.file, (fileForm.file as File).name);
    }
    return this.http.post(url, form);
  }

  getClientDocument(documentId: string): Observable<{ fileBytes: string, errorMessage: string }> {
    const url = `ClientDocument/download/${documentId}`;
    return this.http.get<{ fileBytes: string, errorMessage: string }>(url);
  }

  getClientAdditionalDocument(documentId: string): Observable<{ fileBytes: string }> {
    const url = `ClientDocument/download-additional-proof/${documentId}`;
    return this.http.get<{ fileBytes: string }>(url);
  }

  verifyDocument(data: VerifyDocument): Observable<void> {
    const url = `ClientDocument/document-status/${data.id}`;
    return this.http.put<void>(url, data);
  }

  uploadAdditionalProof(file: File, clientId: string): Observable<void> {
    const url = 'ClientDocument/upload-additional-proof';
    const form = new FormData();
    if (clientId) {
      form.append('ClientId', clientId);
    }
    if (file) {
      form.append('file', file, file.name);
    }
    return this.http.post<void>(url, form);
  }
}
