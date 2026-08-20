import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-insert-html-button',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './insert-html-button.component.html',
  styleUrls: ['./insert-html-button.component.scss']
})
export class InsertHtmlButtonComponent {

  constructor(
    private dialogRef: MatDialogRef<InsertHtmlButtonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  htmlInput = '';
  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

  closeHtmlDialog() {
    this.dialogRef.close(this.htmlInput);
  }

}
