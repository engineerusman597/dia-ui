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
    'downloadFile',
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

  onDownloadFile(row: ClientUploadFile): void {
    this.bulkUploadClientsService.downloadFile(row.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = row.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastrService.success('File downloaded successfully');
      },
      error: () => {
        this.toastrService.error('Failed to download file');
      }
    });
  }
}
