import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AppBulkUploadComponent } from './app-bulk-upload/app-bulk-upload.component';
import { FileFailRecordsComponent } from './file-fail-records/file-fail-records.component';
import { ClientUploadFile } from './client-upload-file';
import { BulkUploadClientsService } from './bulk-upload-clients.service';
import { ToastrService } from 'ngx-toastr';
import { SendRequestConfirmComponent } from './send-request-confirm/send-request-confirm.component';

@Component({
  selector: 'app-bulk-upload-clients',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule,
    AppBulkUploadComponent,
  ],
  templateUrl: './bulk-upload-clients.component.html',
  styleUrls: ['./bulk-upload-clients.component.scss']
})
export class BulkUploadClientsComponent implements OnInit {
  uploadFiles: ClientUploadFile[] = [];
  displayedColumns: string[] = [
    'fileName',
    'status',
    'uploadedByName',
    'uploadedDate',
    'totalRecords',
    'failedCount',
    'successCount',
    'sendRequest',
  ];
  isLoading = false;
  bulkUploadClientsService = inject(BulkUploadClientsService);
  private dialog = inject(MatDialog);
  toastrService = inject(ToastrService);

  ngOnInit(): void {
    this.loadUploadFiles();
  }

  loadUploadFiles(): void {
    this.isLoading = true;
    this.bulkUploadClientsService.getBulkUploadFiles()
      .subscribe({
        next: (data: ClientUploadFile[]) => {
          this.uploadFiles = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onUploadSuccess(): void {
    this.loadUploadFiles();
  }



  onRowClick(row: ClientUploadFile): void {
    this.dialog.open(FileFailRecordsComponent, {
      width: '800px',
      data: { fileId: row.id, fileName: row.fileName },
    });
  }

  // Queues the KYC Verification email for every client from this upload. The API
  // re-checks the password before it queues anything.
  onSendRequest(row: ClientUploadFile): void {
    const dialogRef = this.dialog.open(SendRequestConfirmComponent, {
      width: '460px',
      data: {
        target: row.fileName,
        send: (password: string) =>
          this.bulkUploadClientsService.sendUploadRequest(row.id, password),
      },
    });

    // The dialog performs the send itself so it can report a rejected password
    // inline; it closes with true only once the request has succeeded.
    dialogRef.afterClosed().subscribe((sent: boolean | null) => {
      if (sent) {
        this.toastrService.success('KYC Verification email queued for this upload\'s clients.');
      }
    });
  }
}
