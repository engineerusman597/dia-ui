import { Component, Input, OnDestroy, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
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

type DocumentPreview = {
  isPdf: boolean;
  url: string | SafeResourceUrl;
  objectUrl: string;
};

@Component({
  selector: 'app-client-attachment',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, NgClass, PipesModule],
  templateUrl: './client-attachment.component.html',
  styleUrls: ['./client-attachment.component.scss'],
})
export class ClientAttachmentComponent extends BaseComponent implements OnDestroy {
  @Input({ required: true }) clientForm!: FormGroup;
  @Input() isEditMode = false;
  @Input() currentClient?: Client;

  proofOfIdPreview: DocumentPreview | null = null;
  proofOfAddressPreview: DocumentPreview | null = null;
  additionalDocumentPreviews: DocumentPreview[] = [];

  documentType = DocumentType;
  documentStatus = RequestStatus;

  get documentList(): ClientDocument[] {
    return [
      ...(this.currentClient?.clientDocuments ?? []),
      ...(this.currentClient?.additionalProofDtos ?? [])
    ];
  }

  private sanitizer = inject(DomSanitizer);
  private fileService = inject(FileRequestService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  onFileSelected(event: Event, control: DocumentType) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if(!file && input.files && input.files.length === 0) return;

    if (control === DocumentType.AdditionalDocument) {
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
      this.clientForm.patchValue({ additionalDocument: validFiles });
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