import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientUploadFile } from './client-upload-file';
import { ClientUploadedFileEntry } from './client-uploaded-file-entry';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BulkUploadClientsService {
  constructor(private httpClient: HttpClient) { }

  getBulkUploadFiles(): Observable<ClientUploadFile[]> {
    return this.httpClient.get<ClientUploadFile[]>('clientUploadedFile');
  }

  getFileEntries(fileId: string): Observable<ClientUploadedFileEntry[]> {
    return this.httpClient.get<ClientUploadedFileEntry[]>(`clientUploadedFile/${fileId}/entries`);
  }

  uploadFile(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post<void>('client/upload/csv', formData);
  }

  downloadFile(fileId: string): Observable<Blob> {
    const url = `clientUploadedFile/download-file/${fileId}`;
    return this.httpClient.get(url, { responseType: 'blob' });
  }
}
