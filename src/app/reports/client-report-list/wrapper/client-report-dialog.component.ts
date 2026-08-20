import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ClientReportCoreComponent } from '../client-report-list.component';
import { ClientReportDialogData } from '../../model/client-report-dialog-data';

@Component({
  selector: 'app-client-report-dialog',
  standalone: true,
  imports: [ClientReportCoreComponent, MatDialogModule],
  template: `
    <app-client-report-core
      [mode]="data.mode"
      [fromDate]="data.fromDate ?? null"
      [toDate]="data.toDate ?? null"
      (closeDialog)="close()" />
  `
})
export class ClientReportDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ClientReportDialogData,
    public dialogRef: MatDialogRef<ClientReportDialogComponent>
  ) { }

  close(): void {
    this.dialogRef.close();
  }
}