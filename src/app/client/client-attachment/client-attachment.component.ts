import { Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PipesModule } from '@shared/pipes/pipes.module';
import { BaseComponent } from '../../base.component';
import { FileRequestService } from '../services/file-request.service';
import { Client } from '../model/client';
import { ClientDocument } from '../model/client-documents';
import { DocumentType } from '../model/document-type';
import { RequestStatus } from '../model/request-status';
import { VerifyDocument } from '../model/verify-document';
import { VerifyDocumentComponent } from 'src/app/verify-document/verify-document.component';
import { ClientService } from '../services/client.service';
import { DocumentActionConfirmComponent } from '../document-action-confirm/document-action-confirm.component';
import { DocumentHistoryComponent } from '../document-history/document-history.component';

type DocumentPreview = {
  isPdf: boolean;
  url: string | SafeResourceUrl;
  objectUrl: string;
};

@Component({
  selector: 'app-client-attachment',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, FormsModule, NgClass, PipesModule],
  templateUrl: './client-attachment.component.html',
  styleUrls: ['./client-attachment.component.scss'],
})
export class ClientAttachmentComponent extends BaseComponent implements OnDestroy {
  @Input({ required: true }) clientForm!: FormGroup;
  @Input() isEditMode = false;
  @Input() currentClient?: Client;

  /** Raised when a document's category changes, so the parent can reload the client. */
  @Output() documentsChanged = new EventEmitter<void>();

  proofOfIdPreview: DocumentPreview | null = null;
  proofOfAddressPreview: DocumentPreview | null = null;
  additionalDocumentPreviews: DocumentPreview[] = [];

  documentType = DocumentType;

  /**
   * Category chosen for the next additional-document upload. Starts unset so the
   * uploader has to choose deliberately, and is mirrored onto the form because the
   * parent owns the upload loop.
   */
  additionalUploadType: DocumentType | null = null;

  documentStatus = RequestStatus;

  get documentList(): ClientDocument[] {
    // Additional proofs come from their own table, so flag them here: changing a
    // document's category needs to tell the API which table the id belongs to.
    return [
      ...(this.currentClient?.clientDocuments ?? []).map(d => ({ ...d, isAdditionalProof: false })),
      ...(this.currentClient?.additionalProofDtos ?? []).map(d => ({ ...d, isAdditionalProof: true }))
    ];
  }

  // Categories an admin can move a document into.
  readonly categoryOptions = [
    { value: DocumentType.IdentityProof, label: 'Proof of Id' },
    { value: DocumentType.AddressProof, label: 'Address Proof' },
    { value: DocumentType.AdditionalDocument, label: 'Additional Document' },
  ];

  // Decisions an admin can set from the status badge.
  readonly statusOptions = [
    { value: RequestStatus.Approved, label: 'Approve', icon: 'check_circle' },
    { value: RequestStatus.Rejected, label: 'Reject', icon: 'cancel' },
  ];

  private sanitizer = inject(DomSanitizer);
  private fileService = inject(FileRequestService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private clientService = inject(ClientService);

  onFileSelected(event: Event, control: DocumentType) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if(!file && input.files && input.files.length === 0) return;

    if (control === DocumentType.AdditionalDocument) {
      // The category decides which section the file lands in, so refuse until it is set.
      if (this.additionalUploadType === null) {
        this.toastr.error('Please select the document type first.');
        input.value = '';
        return;
      }

      const maxFiles = 10;

      if (input.files && input.files.length > maxFiles) {
        this.toastr.error(`You can select a maximum of ${maxFiles} files`);
      }

      const selectedFiles = input.files ? Array.from(input.files).slice(0, maxFiles) : [];
      const validFiles: File[] = [];
      const previews: DocumentPreview[] = [];

      selectedFiles.forEach((selectedFile) => {
        if (!this.isValidFile(selectedFile)) {
          this.toastr.error(`Invalid file type: ${selectedFile.name}`);
          return;
        }

        validFiles.push(selectedFile);

        try {
          const preview = this.createPreview(selectedFile);
          if (preview) {
            previews.push(preview);
          }
        } catch (error) {
          console.warn('Preview error', error);
        }
      });

      this.revokePreviewCollection(this.additionalDocumentPreviews);
      this.additionalDocumentPreviews = previews;
      this.clientForm.patchValue({
        additionalDocument: validFiles,
        additionalDocumentType: this.additionalUploadType,
      });
      input.value = '';
      return;
    }

    if (!this.isValidFile(file as File)) {
      this.toastr.error(`Invalid file type: ${file?.name}`);
      return;
    }

    try {
      const preview = this.createPreview(file as File);

      if (!preview) {
        return;
      }

      if (control === DocumentType.IdentityProof) {
        this.revokePreview(this.proofOfIdPreview);
        this.proofOfIdPreview = preview;
      } else {
        this.revokePreview(this.proofOfAddressPreview);
        this.proofOfAddressPreview = preview;
      }

      this.clientForm.patchValue({
        [control === DocumentType.IdentityProof ? 'proofOfId' : 'proofOfAddress']: file,
      });

      input.value = '';
    } catch (error) {
      console.warn('Preview error', error);
    }
  }

  // Files may already be selected when the category is changed, so keep the form in step.
  onAdditionalUploadTypeChange(type: DocumentType | null): void {
    this.clientForm.patchValue({ additionalDocumentType: type });
  }

  isValidFile(file: File): boolean {
    const allowedMimes = ['image/png', 'image/jpeg', 'application/pdf'];
    const allowedExts = ['png', 'jpg', 'jpeg', 'pdf'];
    const fileType = file.type || '';
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    return allowedMimes.includes(fileType) || allowedExts.includes(extension);
  }

  private createPreview(file: File): DocumentPreview | null {
    const objectUrl = URL.createObjectURL(file);

    if (file.type.startsWith('image/')) {
      return { isPdf: false, url: objectUrl, objectUrl };
    }

    if (file.type === 'application/pdf') {
      return {
        isPdf: true,
        url: this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl),
        objectUrl,
      };
    }

    return null;
  }

  getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  openVerify(doc: ClientDocument): string | void {
    if (!doc?.id) {
      return;
    }

    const clientDoc$ = doc.documentType === DocumentType.AdditionalDocument
      ? this.fileService.getClientAdditionalDocument(doc.id)
      : this.fileService.getClientDocument(doc.id);

    this.sub$.sink = clientDoc$.subscribe({
      next: (res: { fileBytes: string }) => {
        if (!res.fileBytes) {
          return;
        }

        const mimeType = this.getMimeType(doc.name || '');
        doc.fileBytes = `data:${mimeType};base64,${res.fileBytes}`;

        if (mimeType === 'application/pdf') {
          doc.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileBytes);
          doc.isPdf = true;
        } else {
          doc.isPdf = false;
        }

        this.openVerifyDailog(doc);
      },
    });
  }

  openVerifyDailog(doc: ClientDocument) {
    if (!this.currentClient) {
      return;
    }

    const ref = this.dialog.open(VerifyDocumentComponent, {
      width: '98%',
      maxWidth: '90vw',
      height: '98vh',
      data: { client: this.currentClient, documents: [doc], isClientView: true },
    });

    this.sub$.sink = ref.afterClosed().subscribe((result: VerifyDocument) => {
      if (!result) {
        return;
      }

      if (result.documentStatus === RequestStatus.Approved) {
        this.toastr.success('Document approved');
        const found = this.currentClient?.clientDocuments?.find((document) => document.id === result.id);
        if (found) {
          found.documentStatus = RequestStatus.Approved;
        }
      } else if (result.documentStatus === RequestStatus.Rejected) {
        this.toastr.error('Document rejected');
        const found = this.currentClient?.clientDocuments?.find((document) => document.id === result.id);
        if (found) {
          found.documentStatus = RequestStatus.Rejected;
        }
      }
    });
  }

  downloadDocument(doc: ClientDocument) {
    if (!doc?.id) {
      return;
    }

    const clientDoc$ = doc.documentType === DocumentType.AdditionalDocument
      ? this.fileService.getClientAdditionalDocument(doc.id)
      : this.fileService.getClientDocument(doc.id);

    this.sub$.sink = clientDoc$.subscribe({
      next: (res: { fileBytes: string }) => {
        const mimeType = this.getMimeType(doc.name || '');
        const link = document.createElement('a');
        link.href = `data:${mimeType};base64,${res.fileBytes}`;
        link.download = doc.name || 'document';
        link.click();
      },
      error: () => {
        this.toastr.error('Failed to download document');
      }
    });
  }

  // Moves a document to another category after confirmation. The parent owns the
  // client, so ask it to reload once the change lands.
  changeCategory(doc: ClientDocument, newType: DocumentType): void {
    if (!doc.id || doc.documentType === newType) {
      return;
    }

    const targetLabel = this.categoryOptions.find(o => o.value === newType)?.label ?? 'the selected category';

    const dialogRef = this.dialog.open(DocumentActionConfirmComponent, {
      width: '460px',
      data: {
        title: 'Change document category',
        message: `Move "${doc.name || 'this document'}" to ${targetLabel}? `
          + `This updates where the document appears and is recorded against your user.`,
        confirmLabel: 'Change category',
        action: () => this.clientService.changeDocumentCategory(
          doc.id!, newType, doc.isAdditionalProof === true),
      },
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((changed: boolean | null) => {
      if (changed) {
        this.toastr.success('Document category updated.');
        this.documentsChanged.emit();
      }
    });
  }

  /**
   * Approving or rejecting is recorded against the signed-in user, so confirm it
   * explicitly and let the dialog report any failure inline. A decision can be
   * changed later, which is why this stays available once a status is set.
   */
  changeStatus(doc: ClientDocument, status: RequestStatus): void {
    if (!doc.id || doc.documentStatus === status) {
      return;
    }

    const isRejection = status === RequestStatus.Rejected;
    const documentName = doc.name || 'this document';
    // Overturning an earlier decision deserves a clearer warning than setting one.
    const isReversal = doc.documentStatus === RequestStatus.Approved
      || doc.documentStatus === RequestStatus.Rejected;
    const previousLabel = doc.documentStatus === RequestStatus.Approved ? 'approved' : 'rejected';

    const dialogRef = this.dialog.open(DocumentActionConfirmComponent, {
      width: '460px',
      data: {
        title: isRejection ? 'Reject document' : 'Approve document',
        message: `${isRejection ? 'Reject' : 'Approve'} "${documentName}"? `
          + (isReversal ? `This document is currently ${previousLabel}. ` : '')
          + `Your user and the current date and time will be recorded against this decision.`,
        confirmLabel: isRejection ? 'Reject' : 'Approve',
        isDestructive: isRejection,
        showNote: isRejection,
        noteLabel: 'Reason for rejection',
        noteRequired: isRejection,
        action: (note: string) => this.fileService.verifyDocument({
          id: doc.id!,
          documentStatus: status,
          description: note,
        }),
      },
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((confirmed: boolean | null) => {
      if (confirmed) {
        this.toastr.success(isRejection ? 'Document rejected' : 'Document approved');
        this.documentsChanged.emit();
      }
    });
  }

  // Full history of uploads, approvals, rejections and category changes.
  openHistory(doc: ClientDocument): void {
    if (!this.currentClient?.id) {
      return;
    }

    this.dialog.open(DocumentHistoryComponent, {
      width: '720px',
      data: { clientId: this.currentClient.id, documentId: doc.id, documentName: doc.name },
    });
  }

  ngOnDestroy(): void {
    this.revokePreview(this.proofOfIdPreview);
    this.revokePreview(this.proofOfAddressPreview);
    this.revokePreviewCollection(this.additionalDocumentPreviews);
    super.ngOnDestroy();
  }

  private revokePreview(preview: DocumentPreview | null) {
    if (preview?.objectUrl) {
      URL.revokeObjectURL(preview.objectUrl);
    }
  }

  private revokePreviewCollection(previews: DocumentPreview[]) {
    previews.forEach((preview) => this.revokePreview(preview));
  }
}