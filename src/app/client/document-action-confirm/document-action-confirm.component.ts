import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';

export interface DocumentActionConfirmData {
  /** Dialog heading, e.g. "Approve document". */
  title: string;
  /** Sentence describing exactly what will happen. */
  message: string;
  /** Label for the confirm button. */
  confirmLabel: string;
  /** Renders the confirm button in red for destructive or rejecting actions. */
  isDestructive?: boolean;
  /** Shows an optional note field, used to capture a rejection reason. */
  showNote?: boolean;
  noteLabel?: string;
  /** Requires the note to be filled before confirming. */
  noteRequired?: boolean;
  /** Runs the action. The dialog owns the result so errors show inline. */
  action: (note: string) => Observable<unknown>;
}

@Component({
  selector: 'app-document-action-confirm',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './document-action-confirm.component.html',
  styleUrl: './document-action-confirm.component.scss',
})
export class DocumentActionConfirmComponent {
  dialogRef = inject(MatDialogRef<DocumentActionConfirmComponent>);
  data = inject<DocumentActionConfirmData>(MAT_DIALOG_DATA);

  note = '';
  isSaving = false;
  errorMessage = '';

  get canConfirm(): boolean {
    if (this.isSaving) {
      return false;
    }
    return !this.data.noteRequired || this.note.trim().length > 0;
  }

  // The action runs from inside the dialog so a failure can be reported here
  // rather than closing and losing what the user typed.
  confirm(): void {
    if (!this.canConfirm) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.data.action(this.note.trim()).subscribe({
      next: () => {
        this.isSaving = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSaving = false;
        // The API returns its messages as a plain string array.
        this.errorMessage = error?.error?.[0]
          ?? error?.error?.messages?.[0]
          ?? error?.messages?.[0]
          ?? 'The action could not be completed. Please try again.';
      },
    });
  }

  onNoteChange(): void {
    this.errorMessage = '';
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
