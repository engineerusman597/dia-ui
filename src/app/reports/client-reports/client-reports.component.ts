import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, forkJoin, switchMap } from 'rxjs';
import { ClientReportMode } from '../model/client-report-mode';
import { ReportsService } from '../reports.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientStatusSummary } from '../model/client-status-summary';
import { MatTableModule } from '@angular/material/table';
import { BaseComponent } from 'src/app/base.component';
import { ClientService } from 'src/app/client/services/client.service';
import { HttpResponse } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { ClientReportPageComponent } from '../client-report-list/wrapper/client-report-page.component';
import { ClientReportDialogData } from '../model/client-report-dialog-data';
import { ClientReportDialogComponent } from '../client-report-list/wrapper/client-report-dialog.component';
import { IdName } from '@core/domain-classes/id-name';

@Component({
  selector: 'app-client-reports',
  standalone: true,
  imports: [
    MatIconModule,
    DatePipe,
    DecimalPipe,
    MatDatepickerModule,
    FormsModule,
    MatTableModule,
    ReactiveFormsModule,
    MatSelectModule,
    ClientReportPageComponent
  ],
  templateUrl: './client-reports.component.html',
  styleUrl: './client-reports.component.scss',
})
export class ClientReportsComponent extends BaseComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private dialog = inject(MatDialog);
  private clientService = inject(ClientService);

  displayedColumns: string[] = ['totalClients', 'completed', 'pending', 'action'];

  fromDate: Date | null = null;
  toDate: Date | null = null;

  totalClients = 0;
  completedPercentage = 0;
  pendingPercentage = 0;
  lastUploadedDate: string | null = null;
  dataSource: ClientStatusSummary[] = [];
  maxDate = new Date();
  assignToUser = new FormControl();
  userControl = new FormControl();
  userList: IdName[] = [];

  readonly reportModes = ClientReportMode;

  ngOnInit(): void {
    this.onChangeTheAssignTo();
    this.loadSummary();

    this.userControl.setValue('');
  }

  loadSummary(): void {
    forkJoin({
      totalClients: this.reportsService.getTotalClientCount(),
      approvalStatus: this.reportsService.getDocumentApprovalStatus(),
      lastUploadedDate: this.reportsService.getLastUploadedDate(),
    }).subscribe({
      next: ({ totalClients, approvalStatus, lastUploadedDate }) => {
        this.totalClients = totalClients.totalClientCount;
        this.completedPercentage = approvalStatus.completedPercentage;
        this.pendingPercentage = approvalStatus.pendingPercentage;
        this.lastUploadedDate = lastUploadedDate.lastUploadedFileDate;
      },
    });
  }

  search(): void {
    this.reportsService
      .getClientDocumentStatusSummary(this.fromDate, this.toDate)
      .subscribe({
        next: (summary) => {
          this.dataSource = [summary as ClientStatusSummary];
        }
      });
  }

  openClientDialog(mode: ClientReportMode): void {
    this.dialog.open(ClientReportDialogComponent, {
      width: '98%',
      maxWidth: '95vw',
      maxHeight: '98vh',
      data: { mode, ...(mode === ClientReportMode.View ? { fromDate: this.fromDate, toDate: this.toDate } : {}) } satisfies ClientReportDialogData,
    });
  }

  clearDates(): void {
    this.fromDate = null;
    this.toDate = null;
    this.dataSource = [];
  }

  getRingStyle(percent: number, color: string): Record<string, string> {
    const safePercent = Math.min(Math.max(percent, 0), 100); // ✅ guard
    return {
      background: `conic-gradient(${color} ${safePercent}%, #d4d4d4 ${safePercent}% 100%)`,
    };
  }

  onChangeTheAssignTo() {
    this.sub$.sink = this.userControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((c) => {
          return this.clientService.getSupportUsersForDropDown(c || '', true);
        })
      )
      .subscribe((resp) => {
        if (resp) {
          const courses = resp as HttpResponse<IdName[]>;
          if (courses && courses.body) {
            this.userList = [...courses.body];
          }
        }
      });
  }

  downloadAssignedReport(): void {
    const selectedUser = this.assignToUser.value;
    if (selectedUser) {
      this.reportsService.downloadCsv(ClientReportMode.Assigned, '', '' , selectedUser.id).subscribe({
        next: (resp) => {
          const response = resp as HttpResponse<Blob>;
          if (response) {
            const blob = new Blob([response.body || new Blob()], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `client_report.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
          }
        },
        error: (err) => {
          console.error('Error downloading report:', err);
        }

      });
    }
  }
}
