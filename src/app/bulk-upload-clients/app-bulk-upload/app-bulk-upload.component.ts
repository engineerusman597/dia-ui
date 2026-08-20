import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { BulkUploadClientsService } from '../bulk-upload-clients.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './app-bulk-upload.component.html',
  styleUrls: ['./app-bulk-upload.component.scss']
})
export class AppBulkUploadComponent {
  @Output() uploadSuccess = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploading = false;

  constructor(
    private bulkUploadClientsService: BulkUploadClientsService,
    private toastrService: ToastrService
  ) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if ((file.type !== 'text/csv' && !file.name.endsWith('.csv')) && (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && !file.name.endsWith('.xlsx'))) {
        this.toastrService.error('Please select a valid CSV or Excel file.');
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  upload(): void {
    if (!this.selectedFile) {
      return;
    }
    this.uploading = true;

    this.bulkUploadClientsService.uploadFile(this.selectedFile)
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: () => {
          this.toastrService.success('Clients uploaded successfully.');
          this.selectedFile = null;
          this.uploadSuccess.emit();
        },
        error: () => {
          this.toastrService.error('Failed to upload clients. Please try again.');
        },
      });
  }
}
