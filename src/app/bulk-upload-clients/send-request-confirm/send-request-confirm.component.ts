import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

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
  data = inject<{ fileName?: string }>(MAT_DIALOG_DATA, { optional: true });
  password = '';
  showPassword = false;

  confirm(): void {
    if (!this.password) {
      return;
    }
    this.dialogRef.close(this.password);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
