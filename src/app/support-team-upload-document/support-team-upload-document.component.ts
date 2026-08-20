import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CameraDialogComponent, CameraDialogResult } from '../upload-documents/camera-dialog/camera-dialog.component';
import { ClientService } from '../client/services/client.service';
import { Client } from '../client/model/client';
import { FileRequestService } from '../client/services/file-request.service';
import { DocumentType } from '../client/model/document-type';
import { ToastrService } from 'ngx-toastr';
import { ClientDocument } from '../client/model/client-documents';
import { RequestStatus } from '../client/model/request-status';
import { MatTooltipModule } from '@angular/material/tooltip';
import { from, Observable, of } from 'rxjs';
import { catchError, concatMap, finalize, map, toArray } from 'rxjs/operators';
import { DatePipe, NgClass } from '@angular/common';
import { PipesModule } from "../shared/pipes/pipes.module";
import { PdfViewerComponent } from '@core/pdf-viewer/pdf-viewer.component';
import { DocumentStatusAlertComponent } from './document-status-alert/document-status-alert.component';

type DocumentPreview = {
  isPdf: boolean;
  url: string | SafeResourceUrl;
};

@Component({
  selector: 'app-support-team-upload-document',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule,
    MatTooltipModule,
    DatePipe,
    NgClass,
    PipesModule,
    PdfViewerComponent,
    DocumentStatusAlertComponent
  ],
  providers: [],
  templateUrl: './support-team-upload-document.component.html',
  styleUrls: ['./support-team-upload-document.component.scss']
})
export class SupportTeamUploadDocumentComponent {
  clientInfo: Client | null = null;
  expiryDateId: Date | null = null;
  issueOrBillDate: Date | null = null;
  updatedAddress: string = '';
  clientId: string | null = null;
  searchPolicyNumber: string = '';

  expiryDateIdError = signal(false);
  issueOrBillDateError = signal(false);
  editingAddress = signal(false);

  sampleIdUrl = 'assets/images/diproof1.jpg';
  sampleAddressUrl = 'assets/images/diproof2.jpg';

  idProofDoc: DocumentPreview = { isPdf: false, url: this.sampleIdUrl };
  addressProofDoc: DocumentPreview = { isPdf: false, url: this.sampleAddressUrl };
  additionalDocumentPreviews: DocumentPreview[] = [];

  additionalFiles: File[] = [];
  idFile: File | null = null;
  addressProofFile: File | null = null;

  isUploading = signal(false);

  isUploadedIdentityProof = false;
  isUploadedProofOfAddress = false;
  isUploadedAdditionalProof = false;
  isAddressUpdated = false;

  minDate = new Date();
  minDateBeforeThreeMonths = new Date(new Date().setMonth(new Date().getMonth() - 3));

  documentType = DocumentType;
  documentStatus = RequestStatus;
  currentDocumentStatusforIdProof: number | null = null;
  currentDocumentStatusforAddressProof: number | null = null;

  constructor(
    private dialog: MatDialog,
    private clientService: ClientService,
    private fileRequestService: FileRequestService,
    private toastr: ToastrService,
    private router: Router
  ) { }

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

  onSearchPolicy() {
    const policy = (this.searchPolicyNumber || '').trim();
    if (!policy) {
      this.toastr.warning('Please enter a policy number to search.');
      return;
    }

    this.clientService.getClientInfoByPolicy(policy).subscribe({
      next: (client) => {
        this.resetForNextClient();
        const clientData = client as Client;
        if (clientData) {
          this.clientInfo = clientData;
          this.clientId = clientData.id || this.clientId;
          if (clientData.clientDocuments) {
            this.setDocuement(clientData.clientDocuments);
          }
          if (clientData.additionalProofDtos) {
            this.setAdditionalProofs(clientData.additionalProofDtos);
          }

          this.currentDocumentStatusforIdProof = this.getDocumentStatus(this.documentType.IdentityProof);
          this.currentDocumentStatusforAddressProof = this.getDocumentStatus(this.documentType.AddressProof);
        }
      },
      error: (err) => {
        console.error('Failed to load client by policy', err);
        this.toastr.error('No client found for the entered policy number.');
      }
    });
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

      const base64 = res.fileBytes;
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

    if (doc?.documentStatus) {
      return doc.documentStatus;
    }

    if (type === DocumentType.IdentityProof) {
      return this.clientInfo?.identityProofStatus ?? null;
    }

    if (type === DocumentType.AddressProof) {
      return this.clientInfo?.addressProofStatus ?? null;
    }

    return null;
  }

  getDocumentDescription(type: DocumentType): string {
    const doc = this.clientInfo?.clientDocuments?.find(
      d => d.documentType === type
    );

    return doc?.description || '';
  }

  isUploaded(type: DocumentType): boolean {
    return this.getDocumentStatus(type) === RequestStatus.Uploaded;
  }

  isApproved(type: DocumentType): boolean {
    return this.getDocumentStatus(type) === RequestStatus.Approved;
  }

  onFileSelected(event: Event, type: DocumentType) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const maxSizeMB = 8;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!this.isValidFileType(file)) {
      this.toastr.error('Only PNG, JPG, JPEG, or PDF files are allowed.');
      input.value = '';
      return;
    }

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

  hasAnyPendingSubmission(): boolean {
    const hasIdentityFile = !!this.idFile && this.canUploadDocumentType(this.documentType.IdentityProof);
    const hasAddressFile = !!this.addressProofFile && this.canUploadDocumentType(this.documentType.AddressProof);
    const hasAdditionalFiles = this.additionalFiles.length > 0;
    return hasIdentityFile || hasAddressFile || hasAdditionalFiles;
  }

  canUploadDocumentType(type: DocumentType): boolean {
    return !this.isApproved(type);
  }

  submitAll() {
    const clientId = this.clientInfo?.id || this.clientId;
    if (!clientId) {
      this.toastr.error('Please search and load a client before submitting.');
      return;
    }

    if (!this.hasAnyPendingSubmission()) {
      this.toastr.warning('Please upload Proof of Id or Address Proof before submitting.');
      return;
    }

    const uploadTasks: Observable<{ success: boolean; message: string }>[] = [];

    if (this.idFile) {
      if (this.canUploadDocumentType(this.documentType.IdentityProof)) {
        uploadTasks.push(
          this.uploadSingleDocument(clientId, this.documentType.IdentityProof, this.idFile, this.expiryDateId, null)
        );
      } else {
        this.toastr.info('Proof of Id already uploaded or approved. Skipped.');
      }
    }

    if (this.addressProofFile) {
      if (this.canUploadDocumentType(this.documentType.AddressProof)) {
        uploadTasks.push(
          this.uploadSingleDocument(clientId, this.documentType.AddressProof, this.addressProofFile, null, this.issueOrBillDate)
        );
      } else {
        this.toastr.info('Address Proof already uploaded or approved. Skipped.');
      }
    }

    if (this.additionalFiles.length > 0) {
      uploadTasks.push(this.uploadAdditionalFilesBatch(clientId));
    }

    if (!uploadTasks.length) {
      this.toastr.warning('No eligible files selected to upload.');
      return;
    }

    this.isUploading.set(true);
    from(uploadTasks).pipe(
      concatMap(task => task),
      toArray(),
      finalize(() => this.isUploading.set(false))
    ).subscribe((results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        this.toastr.success('Selected documents uploaded successfully.');
      }
      if (failCount > 0) {
        this.toastr.error('Some documents failed to upload. Please try again.');
      }
      // If at least one upload succeeded and none failed, reset upload fields for next client
      if (successCount > 0 && failCount === 0) {
        this.resetForNextClient();
      }
    });
  }

  private resetForNextClient() {
    // Clear selected files
    this.idFile = null;
    this.addressProofFile = null;
    this.additionalFiles = [];

    // Reset previews to sample images
    this.idProofDoc = { isPdf: false, url: this.sampleIdUrl };
    this.addressProofDoc = { isPdf: false, url: this.sampleAddressUrl };
    this.additionalDocumentPreviews = [];

    // Reset dates and address
    this.expiryDateId = null;
    this.issueOrBillDate = null;
    this.updatedAddress = '';
    this.editingAddress.set(false);

    // Reset flags
    this.isUploadedIdentityProof = false;
    this.isUploadedProofOfAddress = false;
    this.isUploadedAdditionalProof = false;
    this.isAddressUpdated = false;

    // Clear current client so support can search for next client
    this.clientInfo = null;
    this.clientId = null;
    this.searchPolicyNumber = '';
    this.currentDocumentStatusforIdProof = null;
    this.currentDocumentStatusforAddressProof = null;
  }

  private uploadSingleDocument(
    clientId: string,
    type: DocumentType,
    file: File,
    expiryDate: Date | null,
    issueOrBillDate: Date | null
  ): Observable<{ success: boolean; message: string }> {
    return this.fileRequestService.uploadFile({
      clientId,
      documentType: type,
      file,
      expiryDate,
      issueOrBillDate,
    }, true).pipe(
      map((res: ClientDocument) => {
        const docType = res.documentType;

        if (docType === DocumentType.IdentityProof) {
          this.isUploadedIdentityProof = true;
          this.idFile = null;
        }

        if (docType === DocumentType.AddressProof) {
          this.isUploadedProofOfAddress = true;
          this.addressProofFile = null;
        }

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

        return { success: true, message: 'ok' };
      }),
      catchError(() => of({ success: false, message: 'error' }))
    );
  }

  private uploadAdditionalFilesBatch(clientId: string): Observable<{ success: boolean; message: string }> {
    return from(this.additionalFiles).pipe(
      concatMap((file) =>
        this.fileRequestService.uploadAdditionalProof(file, clientId).pipe(
          map(() => ({ fileName: file.name, isSuccess: true })),
          catchError(() => of({ fileName: file.name, isSuccess: false }))
        )
      ),
      toArray(),
      map((results) => {
        const successCount = results.filter((r) => r.isSuccess).length;
        const failedCount = results.length - successCount;

        if (successCount > 0) {
          this.isUploadedAdditionalProof = true;
          this.additionalFiles = [];
        }

        return {
          success: failedCount === 0,
          message: failedCount === 0 ? 'ok' : 'partial'
        };
      }),
      catchError(() => of({ success: false, message: 'error' }))
    );
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

  onLogout() {
    localStorage.removeItem('bearerToken');
    this.router.navigate(['/login']);
    this.toastr.success('Logged out successfully');
  }
}
