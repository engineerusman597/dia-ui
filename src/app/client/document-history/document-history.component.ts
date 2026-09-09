import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PipesModule } from '@shared/pipes/pipes.module';
import { ClientService } from '../services/client.service';
import { ClientDocumentAudit, DocumentAuditAction } from '../model/client-documents';
import { DocumentType } from '../model/document-type';
import { RequestStatus } from '../model/request-status';

@Component({
  selector: 'app-document-history',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PipesModule,
  ],
  templateUrl: './document-history.component.html',
  styleUrl: './document-history.component.scss',
})
export class DocumentHistoryComponent implements OnInit {
  dialogRef = inject(MatDialogRef<DocumentHistoryComponent>);
  data = inject<{ clientId: string; documentId?: string; documentName?: string }>(MAT_DIALOG_DATA);
  private clientService = inject(ClientService);

  history: ClientDocumentAudit[] = [];
  isLoading = false;
  errorMessage = '';

  auditAction = DocumentAuditAction;

  ngOnInit(): void {
    this.isLoading = true;
    this.clientService.getDocumentAuditHistory(this.data.clientId, this.data.documentId).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.history = (result as ClientDocumentAudit[]) ?? [];
      },
      error: (error) => {
        this.isLoading = false;

        // A 200 that fails to parse means the request reached the SPA fallback
        // instead of the API — almost always a server running an older build.
        const isParseFailure = error?.code === 200 || error?.status === 200;
        if (isParseFailure) {
          this.errorMessage = 'Document history is not available on this server yet. '
            + 'The API needs to be updated to the latest build.';
          return;
        }

        // Otherwise surface what the server actually said.
        const detail = error?.error?.[0]
          ?? error?.error?.messages?.[0]
          ?? error?.messages?.[0]
          ?? error?.statusText;
        const status = error?.code ?? error?.status;
        const suffix = status ? ` (${status})` : '';
        this.errorMessage = detail
          ? `The history could not be loaded${suffix}: ${detail}`
          : `The history could not be loaded${suffix}.`;
      },
    });
  }

  actionLabel(entry: ClientDocumentAudit): string {
    switch (entry.action) {
      case DocumentAuditAction.Uploaded:
        return 'Uploaded';
      case DocumentAuditAction.Approved:
        return 'Approved';
      case DocumentAuditAction.Rejected:
        return 'Rejected';
      case DocumentAuditAction.CategoryChanged:
        return 'Category changed';
      case DocumentAuditAction.Deleted:
        return 'Deleted';
      default:
        return 'Status changed';
    }
  }

  /** Reads the change itself, e.g. "Uploaded -> Approved" or the category move. */
  changeDetail(entry: ClientDocumentAudit): string {
    if (entry.action === DocumentAuditAction.CategoryChanged) {
      return `${this.typeLabel(entry.fromDocumentType)} → ${this.typeLabel(entry.toDocumentType)}`;
    }

    if (entry.fromStatus !== null && entry.fromStatus !== undefined) {
      return `${this.statusLabel(entry.fromStatus)} → ${this.statusLabel(entry.toStatus)}`;
    }

    return this.statusLabel(entry.toStatus);
  }

  badgeClass(entry: ClientDocumentAudit): string {
    switch (entry.action) {
      case DocumentAuditAction.Approved:
        return 'bg-success';
      case DocumentAuditAction.Rejected:
      case DocumentAuditAction.Deleted:
        return 'bg-danger';
      case DocumentAuditAction.CategoryChanged:
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  private typeLabel(type?: DocumentType | null): string {
    switch (type) {
      case DocumentType.IdentityProof:
        return 'Proof of Id';
      case DocumentType.AddressProof:
        return 'Address Proof';
      case DocumentType.AdditionalDocument:
        return 'Additional Document';
      default:
        return 'Unknown';
    }
  }

  private statusLabel(status?: RequestStatus | null): string {
    switch (status) {
      case RequestStatus.Pending:
        return 'Pending';
      case RequestStatus.Uploaded:
        return 'Uploaded';
      case RequestStatus.Rejected:
        return 'Rejected';
      case RequestStatus.Approved:
        return 'Approved';
      default:
        return 'Unknown';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
