import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CameraDialogComponent, CameraDialogResult } from './camera-dialog/camera-dialog.component';
import { ClientService } from '../client/services/client.service';
import { Client } from '../client/model/client';
import { FileRequestService } from '../client/services/file-request.service';
import { DocumentType } from "../client/model/document-type";
import { ToastrService } from 'ngx-toastr';
import { ClientDocument } from '../client/model/client-documents';
import { RequestStatus } from '../client/model/request-status';
import { MatTooltipModule } from '@angular/material/tooltip';
import { from, of } from 'rxjs';
import { catchError, concatMap, finalize, map, toArray } from 'rxjs/operators';
import { PdfViewerComponent } from '@core/pdf-viewer/pdf-viewer.component';
import { SecurityService } from '@core/security/security.service';

type DocumentPreview = {
  isPdf: boolean;
  url: string | SafeResourceUrl;
};

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule,
    MatTooltipModule,
    PdfViewerComponent
  ],
  providers: [],
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.scss']
})
export class UploadDocumentsComponent implements OnInit {
  clientInfo: Client | null = null;
  expiryDateId: Date | null = null;
  issueOrBillDate: Date | null = null;
  updatedAddress: string = '';
  clientId: string | null = null;

  expiryDateIdError = signal(false);
  issueOrBillDateError = signal(false);
  isEditingAddress = signal(false);
  editingAddress = signal(false);

  sampleIdUrl = 'assets/images/diproof1.jpg';
  sampleAddressUrl = 'assets/images/diproof2.jpg';

  idProofDoc: DocumentPreview = { isPdf: false, url: this.sampleIdUrl };
  addressProofDoc: DocumentPreview = { isPdf: false, url: this.sampleAddressUrl };
  additionalDocumentPreviews: DocumentPreview[] = [];

  additionalFiles: File[] = [];
  idFile: File | null = null;
  addressProofFile: File | null = null;

  isUploadingAdditional = signal(false);
  isUploading = signal(false);

  isIdPdf = false;
  isProofPdf = false;
  isUploadedIdentityProof = false;
  isUploadedProofOfAddress = false;
  isUploadedAdditionalProof = false;
  isAddressUpdated = false;

  minDate = new Date();
  minDateBeforeThreeMonths = new Date(new Date().setMonth(new Date().getMonth() - 3));

  documentType = DocumentType;
  documentStatus = RequestStatus;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private fileRequestService: FileRequestService,
    private toastr: ToastrService,
    private router: Router,
    private securityService: SecurityService
  ) { }

  ngOnInit(): void {
    this.securityService.setBearerToken('');
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      this.loadClientInfo(this.clientId);
    }
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (
      (event.ctrlKey && ['+', '-', '=', '0'].includes(event.key)) ||
      (event.ctrlKey && event.key === 'Control')
    ) {
      event.preventDefault();
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    // If more than one finger → it's a pinch gesture
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }

  @HostListener('gesturestart', ['$event'])
  onGestureStart(event: any) {
    event.preventDefault();
  }

  @HostListener('gesturechange', ['$event'])
  onGestureChange(event: any) {
    event.preventDefault();
  }

  @HostListener('gestureend', ['$event'])
  onGestureEnd(event: any) {
    event.preventDefault();
  }

  private loadClientInfo(clientId: string): void {
    this.clientService.getClientInfo(clientId).subscribe({
      next: (client) => {
        const clientData = client as Client;
        if (clientData) {
          this.clientInfo = clientData;
          if (clientData.clientDocuments) {
            this.setDocuement(clientData.clientDocuments);
          }
          if (clientData.additionalProofDtos) {
            this.setAdditionalProofs(clientData.additionalProofDtos);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load client information', err);
      }
    });
  }

  private isValidFileType(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    return allowedTypes.includes(file.type);
  }

  getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'pdf': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  }

  setDocuement(clientDocument: ClientDocument[]) {
    clientDocument.forEach(res => {
      if (res.expiryDate) {
        const date = new Date(res.expiryDate);

        const isDefaultDate =
          date.getDate() === 1 &&
          date.getMonth() === 0 &&
          date.getFullYear() === 1;

        const finalDate = isDefaultDate ? null : date;

        if (res.documentType === DocumentType.IdentityProof) {
          this.expiryDateId = finalDate;
        } else if (res.documentType === DocumentType.AddressProof) {
          this.issueOrBillDate = finalDate;
        }
      }

      if (!res.fileBytes) { return; }

      let base64 = res.fileBytes;
      const mimeType = this.getMimeType(res.name || '');

      if (!mimeType) return;

      const fileBytes = `data:${mimeType};base64,${base64}`;
      const isPdf = mimeType === 'application/pdf';

      const preview: DocumentPreview = {
        url: fileBytes,
        isPdf
      };

      switch (res.documentType) {
        case DocumentType.IdentityProof:
          this.idProofDoc = preview;
          break;

        case DocumentType.AddressProof:
          this.addressProofDoc = preview;
          break;
      }
    });
  }

  private setAdditionalProofs(additional: ClientDocument[] | undefined) {
    this.additionalDocumentPreviews = [];
    if (!additional || !additional.length) {
      return;
    }

    additional.forEach((res) => {
      if (!res.fileBytes) { return; }
      const mimeType = this.getMimeType(res.name || '');
      const dataUrl = `data:${mimeType};base64,${res.fileBytes}`;
      const isPdf = mimeType === 'application/pdf';

      this.additionalDocumentPreviews.push({ isPdf, url: dataUrl });
    });
  }

  getDocumentStatus(type: DocumentType): RequestStatus | null {
    const doc = this.clientInfo?.clientDocuments?.find(
      d => d.documentType === type
    );
    return doc?.documentStatus ?? null;
  }

  isUploaded(type: DocumentType): boolean {
    return this.getDocumentStatus(type) === RequestStatus.Uploaded;
  }

  isApproved(type: DocumentType): boolean {
    return this.getDocumentStatus(type) === RequestStatus.Approved;
  }

  isDisabled(type: DocumentType): boolean {
    const status = this.getDocumentStatus(type);

    return (
      status === RequestStatus.Uploaded ||
      status === RequestStatus.Pending
    );
  }

  onFileSelected(event: Event, type: DocumentType) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!this.isValidFileType(file)) {
      this.toastr.error('Only PNG, JPG, JPEG, or PDF files are allowed.');
      input.value = '';
      return;
    }

    const maxSizeMB = 8;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;


    if (file.size > maxSizeBytes) {
      this.toastr.error('File size must be 8MB or less. Please select a smaller file.');
      input.value = '';
      if (type === DocumentType.IdentityProof) {
        this.idFile = null;
        this.idProofDoc = { isPdf: false, url: this.sampleIdUrl };
      } else {
        this.addressProofFile = null;
        this.addressProofDoc = { isPdf: false, url: this.sampleAddressUrl };
      }
      return;
    }

    const preview = this.createPreview(file);
    if (!preview) {
      return;
    }

    if (type === DocumentType.IdentityProof) {
      this.idFile = file;
      this.idProofDoc = preview;
    } else {
      this.addressProofFile = file;
      this.addressProofDoc = preview;
    }
  }

  onCapture(type: DocumentType) {
    const dialogRef = this.dialog.open(CameraDialogComponent, {
      data: { type },
      panelClass: 'camera-dialog-panel',
      width: '640px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: CameraDialogResult | null) => {
      if (result) {
        if (type === DocumentType.IdentityProof) {
          this.idProofDoc = { isPdf: false, url: result.previewUrl };
          this.idFile = result.file;
        } else {
          this.addressProofDoc = { isPdf: false, url: result.previewUrl };
          this.addressProofFile = result.file;
        }
      }
    });
  }

  onAdditionalFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const maxAdditionalFiles = 10;

    const selectedFiles = Array.from(input.files).slice(0, maxAdditionalFiles);

    if (input.files.length > maxAdditionalFiles) {
      this.toastr.warning(`Only first ${maxAdditionalFiles} files will be considered.`);
    }

    const maxSizeBytes = 8 * 1024 * 1024;
    const validFiles: File[] = [];
    const previews: DocumentPreview[] = [];

    selectedFiles.forEach((file) => {
      if (!this.isValidFileType(file)) {
        this.toastr.error(`Invalid file type: ${file.name}`);
        return;
      }

      if (file.size > maxSizeBytes) {
        this.toastr.error(`File ${file.name} exceeds 8MB.`);
        return;
      }

      const preview = this.createPreview(file);
      if (!preview) {
        this.toastr.error(`Could not create preview for file: ${file.name}`);
        return;
      }

      validFiles.push(file);
      previews.push(preview);
    });

    this.additionalDocumentPreviews = [
      ...(this.additionalDocumentPreviews || []),
      ...previews,
    ];

    this.additionalFiles = [...validFiles];
    input.value = '';
  }

  submitAdditionalProofs() {
    const clientId = this.clientInfo?.id || this.clientId;
    if (!clientId) {
      this.toastr.error('Client ID is missing.');
      return;
    }

    if (this.additionalFiles.length === 0) {
      this.toastr.error('Please choose at least one file.');
      return;
    }

    this.isUploadingAdditional.set(true);

    from(this.additionalFiles).pipe(
      concatMap((file) =>
        this.fileRequestService.uploadAdditionalProof(file, clientId).pipe(
          map(() => ({ fileName: file.name, isSuccess: true })),
          catchError(() => of({ fileName: file.name, isSuccess: false }))
        )
      ),
      toArray(),
      finalize(() => this.isUploadingAdditional.set(false))
    ).subscribe((results) => {
      const successCount = results.filter((r) => r.isSuccess).length;
      const failedCount = results.length - successCount;

      if (successCount > 0) {
        this.isUploadedAdditionalProof = true;
        this.toastr.success(`${successCount} additional document(s) uploaded successfully.`);
        this.additionalFiles = [];
      }

      if (failedCount > 0) {
        this.toastr.error(`${failedCount} additional document(s) failed to upload.`);
      }
    });
  }

  private createPreview(file: File): DocumentPreview | null {
    const objectUrl = URL.createObjectURL(file);

    if (file.type.startsWith('image/')) {
      return { isPdf: false, url: objectUrl };
    }

    if (file.type === 'application/pdf') {
      return {
        isPdf: true,
        url: objectUrl,
      };
    }

    return null;
  }

  openAddressEdit() {
    if (this.clientInfo) {
      this.updatedAddress = this.clientInfo.physicalAddress || '';
    }
    this.editingAddress.set(true);
  }

  updateAddress() {
    if (!this.clientId) {
      console.error('Client ID is missing');
      return;
    }

    this.clientService.updateClientAddress(this.clientInfo?.id || '', this.updatedAddress).subscribe({
      next: (response) => {
        this.isAddressUpdated = true;
        if (response) {
          const updatedClient = response as Client;
          if (updatedClient.id) {
            this.clientInfo = {
              ...this.clientInfo,
              physicalAddress: updatedClient.physicalAddress
            } as Client;
          }
        }
        this.editingAddress.set(false);
      },
      error: () => {
        this.editingAddress.set(false);
      }
    });
  }

  submit(type: DocumentType) {
    this.isUploading.set(true);

    this.fileRequestService.uploadFile({
      clientId: this.clientInfo?.id || '',
      documentType: type === this.documentType.IdentityProof ? DocumentType.IdentityProof : DocumentType.AddressProof,
      file: type === this.documentType.IdentityProof ? this.idFile as File : this.addressProofFile as File,
      expiryDate: type === this.documentType.IdentityProof ? this.expiryDateId : null,
      issueOrBillDate: type === this.documentType.AddressProof ? this.issueOrBillDate : null
    }, false).subscribe({
      next: (res: ClientDocument) => {
        const message = type === this.documentType.IdentityProof
          ? 'Proof of Id document uploaded successfully'
          : 'Proof of Address document uploaded successfully';
        this.toastr.success(message);

        const docType = res.documentType;
        docType === DocumentType.IdentityProof ? this.isUploadedIdentityProof = true : this.isUploadedProofOfAddress = true;

        this.clientInfo = {
          ...this.clientInfo,
          clientDocuments: (this.clientInfo?.clientDocuments || []).filter(d => d.documentType !== docType)
        } as Client;

        this.clientInfo = {
          ...this.clientInfo,
          clientDocuments: [
            ...(this.clientInfo?.clientDocuments || []),
            { ...res, documentStatus: RequestStatus.Uploaded }
          ]
        } as Client;
        this.isUploading.set(false);
      },
      error: () => {
        this.isUploading.set(false);
      }
    });
  }

  onLogout() {
    localStorage.removeItem('bearerToken');
    this.router.navigate(['/login']);
    this.toastr.success('Logged out successfully');
  }
}
