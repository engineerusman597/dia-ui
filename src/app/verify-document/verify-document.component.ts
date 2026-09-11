import { Component, inject, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
import { ClientPendingApprovalStore } from '../dashboard/clients-pending-approval/clients-pending-approval-store';
import { ClientRejectedDocumentStore } from '../dashboard/clients-reject-document/clients-reject-document-store';
import { PdfViewerComponent } from '@core/pdf-viewer/pdf-viewer.component';
import { DocumentActionConfirmComponent } from '../client/document-action-confirm/document-action-confirm.component';
import { DocumentHistoryComponent } from '../client/document-history/document-history.component';

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
export class VerifyDocumentComponent implements OnDestroy {
  client: Client | null;
  documents: ClientDocument[];
  documentType = DocumentType;
  documentStatus = RequestStatus;
  hasDocumentBeenUpdated = false;
  private objectUrls: string[] = [];

  commonDialogService = inject(CommonDialogService);
  dialog = inject(MatDialog);
  clientService = inject(ClientService);
  sanitizer = inject(DomSanitizer);
  fileRequestService = inject(FileRequestService);
  toaster = inject(ToastrService);
  clientPendingApprovalStore = inject(ClientPendingApprovalStore);
  clientRejectedDocumentStore = inject(ClientRejectedDocumentStore);

  constructor(
    public dialogRef: MatDialogRef<VerifyDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: Client; documents: ClientDocument[], isClientView?: boolean },
  ) {
    if (data?.isClientView) {
      this.client = data?.client ?? null;
      this.documents = data?.documents ?? [];
      // Parent may already have loaded a preview; otherwise load on demand.
      this.documents.forEach((doc) => {
        if (!doc.fileBytes && !doc.safeFileUrl) {
          // leave unloaded until user clicks Load preview (or auto-load single doc)
        }
      });
      if (this.documents.length === 1) {
        this.loadFile(this.documents[0]);
      }
    } else {
      this.client = null;
      this.documents = [];
      this.loadDocument(data?.client?.id!);
    }
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls = [];
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
    this.clientService.getClientInfo(clientId, false).subscribe({
      next: (res) => {
        const clientInfo = res as Client;
        this.client = clientInfo;
        this.documents = clientInfo.clientDocuments ?? [];
        // Lazy-load: only the first document up front; others via Load preview.
        if (this.documents.length > 0) {
          this.loadFile(this.documents[0]);
        }
      }
    });
  }

  /** Pulls one document's content as a blob and renders it via object URL. */
  loadFile(doc: ClientDocument): void {
    if (!doc?.id || doc.fileBytes || doc.isLoadingFile) {
      return;
    }

    doc.isLoadingFile = true;

    const file$ = doc.documentType === DocumentType.AdditionalDocument
      ? this.fileRequestService.getClientAdditionalDocument(doc.id)
      : this.fileRequestService.getClientDocument(doc.id);

    file$.subscribe({
      next: (blob: Blob) => {
        doc.isLoadingFile = false;
        if (!blob || blob.size === 0) {
          doc.fileLoadFailed = true;
          return;
        }
        this.applyBlobPreview(doc, blob);
      },
      error: () => {
        doc.isLoadingFile = false;
        doc.fileLoadFailed = true;
      },
    });
  }

  private applyBlobPreview(doc: ClientDocument, blob: Blob): void {
    const mimeType = blob.type || this.getMimeType(doc.name || '');
    const typedBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
    const objectUrl = URL.createObjectURL(typedBlob);
    this.objectUrls.push(objectUrl);

    doc.fileBytes = objectUrl;
    doc.isPdf = mimeType === 'application/pdf'
      || ((doc.name || '').toLowerCase().endsWith('.pdf'));
    if (doc.isPdf) {
      doc.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    }
  }

  onApprove(doc: ClientDocument) {
    this.confirmStatusChange(doc, RequestStatus.Approved);
  }

  onReject(doc: ClientDocument) {
    this.confirmStatusChange(doc, RequestStatus.Rejected);
  }

  private confirmStatusChange(doc: ClientDocument, status: RequestStatus) {
    if (!doc?.id) {
      return;
    }

    const isRejection = status === RequestStatus.Rejected;
    const documentName = doc.name || 'this document';

    const ref = this.dialog.open(DocumentActionConfirmComponent, {
      width: '460px',
      data: {
        title: isRejection ? 'Reject document' : 'Approve document',
        message: `${isRejection ? 'Reject' : 'Approve'} "${documentName}"? `
          + `Your user and the current date and time will be recorded against this decision.`,
        confirmLabel: isRejection ? 'Reject' : 'Approve',
        isDestructive: isRejection,
        showNote: isRejection,
        noteLabel: 'Reason for rejection',
        noteRequired: isRejection,
        action: (note: string) => this.fileRequestService.verifyDocument({
          id: doc.id!,
          documentStatus: status,
          description: note,
        }),
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean | null) => {
      if (confirmed) {
        this.onStatusChanged({ id: doc.id!, documentStatus: status, description: '' });
      }
    });
  }

  private onStatusChanged(data: VerifyDocument) {
    data.documentStatus === RequestStatus.Approved
      ? this.toaster.success('Document approved')
      : this.toaster.success('Document rejected');

    // Refresh only the dashboard queues — do not poke ClientStore (avoids full Client list reload).
    this.clientPendingApprovalStore.loadByQuery(this.clientPendingApprovalStore.filterParameters());
    this.clientRejectedDocumentStore.loadByQuery(this.clientRejectedDocumentStore.filterParameters());

    if (this.data.isClientView) {
      this.dialogRef.close(data);
      return;
    }

    const found = this.documents.find(d => d.id === data.id);
    if (found) {
      found.documentStatus = data.documentStatus;
      found.statusChangedDate = new Date().toISOString();
      found.documentType === DocumentType.IdentityProof
        ? this.client!.identityProofStatus = data.documentStatus
        : this.client!.addressProofStatus = data.documentStatus;
    }
  }

  openHistory(doc: ClientDocument) {
    if (!this.client?.id) {
      return;
    }

    this.dialog.open(DocumentHistoryComponent, {
      width: '720px',
      data: { clientId: this.client.id, documentId: doc.id, documentName: doc.name },
    });
  }

  download(doc: ClientDocument) {
    try {
      if (doc.fileBytes && typeof doc.fileBytes === 'string' && !doc.fileBytes.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = doc.fileBytes;
        a.download = doc.name || 'document';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      if (!doc.id) {
        this.toaster.error('No file available to download');
        return;
      }

      const file$ = doc.documentType === DocumentType.AdditionalDocument
        ? this.fileRequestService.getClientAdditionalDocument(doc.id)
        : this.fileRequestService.getClientDocument(doc.id);

      file$.subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.name || 'document';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        },
        error: () => this.toaster.error('Failed to download file'),
      });
    } catch {
      this.toaster.error('Failed to download file');
    }
  }
}
