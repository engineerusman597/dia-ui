import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientDocument } from '../model/client-documents';
import { DocumentType } from '../model/document-type';
import { VerifyDocument } from 'src/app/client/model/verify-document';

@Injectable({ providedIn: 'root' })
export class FileRequestService {
  constructor(private http: HttpClient) { }

  uploadFile(fileForm: ClientDocument, isAdmin: boolean): Observable<any> {
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
      form.append('file', fileForm.file, (fileForm.file as File).name);
    }
    return this.http.post(url, form);
  }

  /** Binary file download (not JSON base64). */
  getClientDocument(documentId: string): Observable<Blob> {
    const url = `ClientDocument/download/${documentId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getClientAdditionalDocument(documentId: string): Observable<Blob> {
    const url = `ClientDocument/download-additional-proof/${documentId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  verifyDocument(data: VerifyDocument): Observable<void> {
    const url = `ClientDocument/document-status/${data.id}`;
    return this.http.put<void>(url, data);
  }

  /**
   * The uploader picks the category, so pass it through: the API files identity and
   * address proofs into the reviewed sections and everything else as an additional proof.
   */
  uploadAdditionalProof(
    file: File,
    clientId: string,
    documentType: DocumentType = DocumentType.AdditionalDocument
  ): Observable<void> {
    const url = 'ClientDocument/upload-additional-proof';
    const form = new FormData();
    if (clientId) {
      form.append('ClientId', clientId);
    }
    form.append('DocumentType', documentType.toString());
    if (file) {
      form.append('file', file, file.name);
    }
    return this.http.post<void>(url, form);
  }
}
