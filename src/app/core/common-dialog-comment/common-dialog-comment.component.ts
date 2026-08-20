import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-common-dialog-comment',
  templateUrl: './common-dialog-comment.component.html',
  styleUrl: './common-dialog-comment.component.scss',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class CommonDialogCommentComponent {
  primaryMessage: string;
  note: string = '';
  comment: string = '';
  commentRequired = signal(false);

  constructor(public dialogRef: MatDialogRef<CommonDialogCommentComponent>) { }

  clickHandler(flag: boolean): void {
    if (flag && !this.comment.trim()) {
      this.commentRequired.set(true);
      return;
    }
    this.commentRequired.set(false);
    this.dialogRef.close({
      flag: flag,
      comment: this.comment
    });
  }
}
