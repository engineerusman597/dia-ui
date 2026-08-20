import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ClientUploadedFileEntry } from '../client-uploaded-file-entry';
import { BulkUploadClientsService } from '../bulk-upload-clients.service';

@Component({
  selector: 'app-file-fail-records',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './file-fail-records.component.html',
  styleUrls: ['./file-fail-records.component.scss']
})
export class FileFailRecordsComponent implements OnInit {
  data: { fileId: string; fileName: string } = inject(MAT_DIALOG_DATA);

  entries: ClientUploadedFileEntry[] = [];
  displayedColumns: string[] = ['email', 'policyNumber', 'errorMessage'];
  isLoading = false;

  private bulkUploadClientsService = inject(BulkUploadClientsService);

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.isLoading = true;
    this.bulkUploadClientsService.getFileEntries(this.data.fileId).subscribe({
      next: (data) => {
        this.entries = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
