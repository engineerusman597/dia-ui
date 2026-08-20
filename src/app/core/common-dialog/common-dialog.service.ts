import { Injectable } from '@angular/core'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CommonDialogComponent } from './common-dialog.component';
import { CommonDialogCommentComponent } from '@core/common-dialog-comment/common-dialog-comment.component';
@Injectable()
export class CommonDialogService {
    dialogConfig: MatDialogConfig = {
        disableClose: false,
        width: '',
        height: '',
        position: {
            top: '',
            bottom: '',
            left: '',
            right: ''
        }
    };
    constructor(public dialog: MatDialog) { }

    deleteConformationDialog(message: string): Observable<boolean> {
        const dialogRef = this.dialog.open(CommonDialogComponent, this.dialogConfig);
        dialogRef.componentInstance.primaryMessage = message;
        return dialogRef.afterClosed();
    }

    deleteConfirmWithCommentDialog(message: string, note: string = ''): Observable<{ flag: boolean, comment: string }> {
        const dialogRef = this.dialog.open(CommonDialogCommentComponent, this.dialogConfig);
        dialogRef.componentInstance.primaryMessage = message;
        dialogRef.componentInstance.note = note;
        return dialogRef.afterClosed();
    }
}
