import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';

export interface SendRequestConfirmData {
  /** Shown in bold in the dialog body, e.g. the upload's file name. */
  target?: string;
  /** Runs the send with the entered password. The dialog owns the result. */
  send: (password: string) => Observable<unknown>;
}

@Component({
  selector: 'app-send-request-confirm',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './send-request-confirm.component.html',
  styleUrl: './send-request-confirm.component.scss',
})
export class SendRequestConfirmComponent {
  dialogRef = inject(MatDialogRef<SendRequestConfirmComponent>);
  data = inject<SendRequestConfirmData>(MAT_DIALOG_DATA);

  password = '';
  showPassword = false;
  isSending = false;
  errorMessage = '';

  // The send runs from inside the dialog so a rejected password can be reported
  // against the field instead of closing the dialog.
  confirm(): void {
    if (!this.password || this.isSending) {
      return;
    }

    this.isSending = true;
    this.errorMessage = '';

    this.data.send(this.password).subscribe({
      next: () => {
        this.isSending = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSending = false;
        // The API returns its messages as a plain string array.
        this.errorMessage = error?.error?.[0]
          ?? error?.error?.messages?.[0]
          ?? error?.messages?.[0]
          ?? 'Failed to send requests. Please try again.';
      },
    });
  }

  onPasswordChange(): void {
    this.errorMessage = '';
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
