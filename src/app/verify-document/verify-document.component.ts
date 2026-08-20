import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { Client } from 'src/app/client/model/client';
import { ClientDocument } from 'src/app/client/model/client-documents';
import { PipesModule } from '@shared/pipes/pipes.module';
import { RequestStatus } from '../client/model/request-status';
import { VerifyDocument } from '../client/model/verify-document';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { ClientService } from '../client/services/client.service';
import { DocumentType } from '../client/model/document-type';
import { DomSanitizer } from '@angular/platform-browser';
import { FileRequestService } from '../client/services/file-request.service';
import { ToastrService } from 'ngx-toastr';
import { ClientStore } from '../client/client-store';
import { ClientPendingApprovalStore } from '../dashboard/clients-pending-approval/clients-pending-approval-store';
import { ClientRejectedDocumentStore } from '../dashboard/clients-reject-document/clients-reject-document-store';
import { PdfViewerComponent } from '@core/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-verify-document',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    PipesModule,
    PdfViewerComponent,
    NgClass
  ],
  templateUrl: './verify-document.component.html',
  styleUrls: ['./verify-document.component.scss']
})
export class VerifyDocumentComponent {
  client: Client | null;
  documents: ClientDocument[];
  documentType = DocumentType;
  documentStatus = RequestStatus;
  hasDocumentBeenUpdated = false;

  commonDialogService = inject(CommonDialogService);
  clientService = inject(ClientService);
  sanitizer = inject(DomSanitizer);
  fileRequestService = inject(FileRequestService);
  toaster = inject(ToastrService);
  clientStore = inject(ClientStore);
  clientPendingApprovalStore = inject(ClientPendingApprovalStore);
  clientRejectedDocumentStore = inject(ClientRejectedDocumentStore);

  constructor(
    public dialogRef: MatDialogRef<VerifyDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: Client; documents: ClientDocument[], isClientView?: boolean },
  ) {
    if (data?.isClientView) {
      this.client = data?.client ?? null;
      this.documents = data?.documents ?? [];
    } else {
      this.client = null;
      this.documents = [];
      this.loadDocument(data?.client?.id!);
    }
  }

  getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg': return 'image/jpg';
      case 'jpeg': return 'image/jpeg';
      case 'pdf': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  }

  loadDocument(clientId: string) {
    this.clientService.getClientInfo(clientId).subscribe({
      next: (res) => {
        const clientInfo = res as Client;
        this.client = clientInfo;
        this.documents = this.processDocuments(clientInfo.clientDocuments ?? []);
      }
    });
  }

  processDocuments(docs: ClientDocument[] = []): ClientDocument[] {
    return docs
      .filter(doc => doc?.fileBytes) // remove empty docs
      .map(doc => this.transformDocument(doc));
  }

  transformDocument(doc: ClientDocument): ClientDocument {
    const mimeType = this.getMimeType(doc.name || '');

    if (!mimeType) return doc;

    const base64Url = `data:${mimeType};base64,${doc.fileBytes}`;
    doc.fileBytes = base64Url;

    if (mimeType === 'application/pdf') {
      doc.safeFileUrl = base64Url;
      doc.isPdf = true;
    } else {
      doc.isPdf = false;
    }

    return doc;
  }

  onApprove(doc: ClientDocument) {
    this.commonDialogService.deleteConformationDialog('Are you sure you want to approve this document?').subscribe(confirmed => {
      if (confirmed) {
        const verifyData: VerifyDocument = {
          id: doc.id!,
          documentStatus: RequestStatus.Approved,
          description: ''
        };

        this.updateDocumentStatus(verifyData);
      }
    });
  }

  onReject(doc: ClientDocument) {
    this.commonDialogService
      .deleteConfirmWithCommentDialog('Are you sure you want to reject this document?')
      .subscribe((data: { flag: boolean; comment: string }) => {
        if (data.flag) {
          const verifyData: VerifyDocument = {
            id: doc.id!,
            documentStatus: RequestStatus.Rejected,
            description: data.comment
          };

          this.updateDocumentStatus(verifyData);
        }
      });
  }

  updateDocumentStatus(data: VerifyDocument) {
    this.fileRequestService.verifyDocument(data).subscribe({
      next: () => {
        data.documentStatus === RequestStatus.Approved ? this.toaster.success('Document approved') : this.toaster.success('Document rejected');
        this.clientStore.loadByQuery(this.clientStore.filterParameters());
        this.clientPendingApprovalStore.loadByQuery(this.clientPendingApprovalStore.filterParameters());
        this.clientRejectedDocumentStore.loadByQuery(this.clientRejectedDocumentStore.filterParameters());
        if (this.data.isClientView) {
          this.dialogRef.close(data);
          return;
        }
        const found = this.documents.find(d => d.id === data.id);
        if (found) {
          found.documentStatus = data.documentStatus;
          found.documentType === DocumentType.IdentityProof ? this.client!.identityProofStatus = data.documentStatus : this.client!.addressProofStatus = data.documentStatus;
        }
      },
      error: () => {
        this.toaster.error('Failed to approve document');
      }
    });
  }

  download(doc: ClientDocument) {
    try {
      const dataUrl = doc.fileBytes as string;
      if (!dataUrl) {
        this.toaster.error('No file available to download');
        return;
      }

      let mime = this.getMimeType(doc.name || '') || 'application/octet-stream';
      let base64 = '';

      if (dataUrl.startsWith('data:')) {
        const parts = dataUrl.split(',');
        const meta = parts[0];
        base64 = parts[1];
        const m = meta.match(/data:(.*?);/);
        if (m && m[1]) mime = m[1];
      } else {
        // If it's raw base64 without data url
        base64 = dataUrl;
      }

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      this.toaster.error('Failed to download file');
    }
  }
}
