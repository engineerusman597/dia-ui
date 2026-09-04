
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { FileRequest, FileRequestResponse, ReminderType } from './model/file-request';
import { MatDialog } from '@angular/material/dialog';
import { SendRequestConfirmComponent } from '../bulk-upload-clients/send-request-confirm/send-request-confirm.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RequestStatus } from '../client/model/request-status';
import { PipesModule } from '@shared/pipes/pipes.module';
import { FileRequestsService } from './file-requests.service';
import { FileRequestParameters } from './model/file.request-parameters';
import { HttpResponse } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { BaseComponent } from '../base.component';
import { debounceTime, distinctUntilChanged, merge, Subject, switchMap, tap } from 'rxjs';
import { ClientService } from '../client/services/client.service';
import { IdName } from '@core/domain-classes/id-name';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { EmailStatus } from './model/email-status';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-file-requests',
  standalone: true,
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    PipesModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSortModule,
    MatPaginator,
    MatButtonModule,
    NgClass
  ],
  templateUrl: './file-requests.component.html',
  styleUrl: './file-requests.component.css'
})
export class FileRequestsComponent extends BaseComponent implements OnInit, AfterViewInit {
  fileRequests: FileRequest[] = [];
  isAll = false;
  reminderType = ReminderType;
  // Only one of "Notify All" / the three reminders can be active at a time.
  selectedReminderType: ReminderType | null = null;
  clientInput = new FormControl('');
  selectedClients: IdName[] = [];
  filteredClients: IdName[] = [];
  displayedColumns: string[] = ['name', 'email', 'status', 'sentDate', 'policyNumber', 'createdDate', 'identityProofStatus', 'addressProofStatus'];
  displayedColumnSecondary: string[] = ['search-name', 'search-email', 'search-status', 'search-sentDate', 'search-policyNumber', 'search-createdDate', 'search-identityProofStatus', 'search-addressProofStatus'];
  footerToDisplayed: string[] = ['footer'];
  emailStatus = EmailStatus;
  documentStatusPipe = RequestStatus;
  documentStatus = Object.values(RequestStatus).filter(value => typeof value === 'number') as number[];
  emailStatusOptions = Object.values(EmailStatus).filter(value => typeof value === 'number') as number[];
  filterParamters: FileRequestParameters = {
    orderBy: 'createdDate asc',
    pageSize: 10,
    skip: 0,
    totalCount: 0,
    addressProofStatus: null,
    identityProofStatus: null,
    status: null,
    email: '',
    name: '',
    policyNumber: ''
  };

  clientService = inject(ClientService);
  toastrService = inject(ToastrService);
  fileService = inject(FileRequestsService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterParameter$: Subject<string> = new Subject<string>();
  _nameFilter = this.filterParamters.name;
  _emailFilter = this.filterParamters.email;
  _identityProofStatusFilter = this.filterParamters.identityProofStatus;
  _addressProofStatusFilter = this.filterParamters.addressProofStatus;
  _emailStatusFilter = this.filterParamters.status;
  _policyNumberFilter = this.filterParamters.policyNumber;

  public get nameFilter(): string {
    return this._nameFilter ?? '';
  }

  public set nameFilter(v: string) {
    if (this._nameFilter !== v) {
      this._nameFilter = v;
      const nameFilter = `name#${v}`;
      this.filterParameter$.next(nameFilter);
    }
  }

  public get identityProofStatusFilter(): number | null {
    return this._identityProofStatusFilter ?? null;
  }

  public set identityProofStatusFilter(v: number | null) {
    if (this._identityProofStatusFilter !== v) {
      this._identityProofStatusFilter = v as number;
      const identityProofStatusFilter = `identityProofStatus#${v}`;
      this.filterParameter$.next(identityProofStatusFilter);
    }
  }

  public get addressProofStatusFilter(): number | null {
    return this._addressProofStatusFilter ?? null;
  }

  public set addressProofStatusFilter(v: number | null) {
    if (this._addressProofStatusFilter !== v) {
      this._addressProofStatusFilter = v as number;
      const addressProofStatusFilter = `addressProofStatus#${v}`;
      this.filterParameter$.next(addressProofStatusFilter);
    }
  }

  public get emailFilter(): string {
    return this._emailFilter ?? '';
  }

  public set emailFilter(v: string) {
    if (this._emailFilter !== v) {
      this._emailFilter = v;
      const emailFilter = `email#${v}`;
      this.filterParameter$.next(emailFilter);
    }
  }

  public get emailStatusFilter(): number | null {
    return this._emailStatusFilter ?? null;
  }

  public set emailStatusFilter(v: number | null) {
    if (this._emailStatusFilter !== v) {
      this._emailStatusFilter = v as number;
      const emailStatusFilter = `status#${v}`;
      this.filterParameter$.next(emailStatusFilter);
    }
  }

  public get policyNumberFilter(): string {
    return this._policyNumberFilter ?? '';
  }

  public set policyNumberFilter(v: string) {
    if (this._policyNumberFilter !== v) {
      this._policyNumberFilter = v;
      const policyNumberFilter = `policyNumber#${v}`;
      this.filterParameter$.next(policyNumberFilter);
    }
  }

  ngOnInit() {
    this.getAllFileRequests(this.filterParamters);
    this.onClinetInputChange();

    this.sub$.sink = this.filterParameter$
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe((c: string) => {
        this.filterParamters.skip = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        const filterArray: Array<string> = c.split('#');
        if (filterArray[0] === 'name') {
          this.filterParamters.name = filterArray[1];
        } else if (filterArray[0] === 'email') {
          this.filterParamters.email = filterArray[1];
        } else if (filterArray[0] === 'status') {
          this.filterParamters.status = filterArray[1] !== '' ? Number(filterArray[1]) : null;
        } else if (filterArray[0] === 'policyNumber') {
          this.filterParamters.policyNumber = filterArray[1];
        } else if (filterArray[0] === 'identityProofStatus') {
          this.filterParamters.identityProofStatus = filterArray[1] !== '' ? Number(filterArray[1]) : null;
        } else if (filterArray[0] === 'addressProofStatus') {
          this.filterParamters.addressProofStatus = filterArray[1] !== '' ? Number(filterArray[1]) : null;
        }
        this.getAllFileRequests(this.filterParamters);
      });
  }
  refresh() {
    this.getAllFileRequests(this.filterParamters);
  }

  getAllFileRequests(filterParameters: FileRequestParameters) {
    this.fileService.getAllFileRequests(filterParameters).subscribe({
      next: (response) => {
        const results = response as HttpResponse<FileRequest[]>;
        if (results.body) {
          this.fileRequests = results.body;
        }
        if (results.headers.get('X-Pagination')) {
          const pagination = JSON.parse(results.headers.get('X-Pagination')!);
          this.filterParamters.totalCount = pagination.totalCount;
        }
      }
    });
  }

  onClinetInputChange() {
    this.sub$.sink = this.clientInput.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((c) => {
          return this.clientService.getClientsForDropDown(c || '');
        })
      )
      .subscribe((resp) => {
        if (resp) {
          const clients = resp as HttpResponse<IdName[]>;
          if (clients && clients.body) {
            this.filteredClients = [...clients.body];
          }
        }
      });
  }

  // "Notify All" and the three reminders are mutually exclusive, so turning one
  // on clears the others.
  onIsAllChange(checked: boolean) {
    this.isAll = checked;
    if (checked) {
      this.selectedReminderType = null;
    }
  }

  onReminderTypeChange(type: ReminderType, checked: boolean) {
    this.selectedReminderType = checked ? type : null;
    if (checked) {
      this.isAll = false;
    }
  }

  sendRequest() {
    if (!this.isAll && this.selectedReminderType === null && this.selectedClients.length === 0) {
      this.toastrService.error('Please select at least one client, a reminder, or choose "Notify All".');
      return;
    }

    // Work out what is being sent, then confirm with the password before the
    // request leaves the browser.
    const { payload, target, successMessage } = this.buildSendRequest();

    const dialogRef = this.dialog.open(SendRequestConfirmComponent, {
      width: '460px',
      data: {
        target,
        send: (password: string) =>
          this.fileService.updateFileRequest({ ...payload, password }),
      },
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((sent: boolean | null) => {
      if (sent) {
        this.toastrService.success(successMessage);
        this.resetFileRequest();
        this.getAllFileRequests(this.filterParamters);
      }
    });
  }

  private buildSendRequest(): {
    payload: FileRequestResponse;
    target: string;
    successMessage: string;
  } {
    if (this.isAll) {
      return {
        payload: { clientIds: [], isAll: true },
        target: 'all clients with pending document uploads',
        successMessage: 'Request sent to all clients.',
      };
    }

    if (this.selectedReminderType !== null && this.selectedClients.length === 0) {
      // Reminder with no explicit client selection: the API resolves the matching
      // clients from their outstanding document statuses.
      return {
        payload: {
          clientIds: [],
          isAll: false,
          reminderType: this.selectedReminderType,
        },
        target: this.reminderLabel(this.selectedReminderType),
        successMessage: 'Reminder queued for all matching clients.',
      };
    }

    const names = this.selectedClients.map((c) => c.name).join(', ');
    return {
      payload: {
        clientIds: this.selectedClients.map((c) => c.id),
        isAll: false,
        reminderType: this.selectedReminderType ?? ReminderType.KycVerification,
      },
      target: names,
      successMessage: 'Request sent to: ' + names,
    };
  }

  private reminderLabel(type: ReminderType): string {
    switch (type) {
      case ReminderType.BothPendingRejected:
        return 'every client with both documents pending or rejected';
      case ReminderType.IdPendingRejected:
        return 'every client with ID pending or rejected';
      case ReminderType.PoaPendingRejected:
        return 'every client with proof of address pending or rejected';
      default:
        return 'all matching clients';
    }
  }

  resetFileRequest() {
    this.isAll = false;
    this.selectedReminderType = null;
    this.selectedClients = [];
    this.clientInput.setValue('');
    this.filteredClients = [];
  }

  onClientSelected(event: MatAutocompleteSelectedEvent): void {
    const client = event.option.value as IdName;
    if (!client) {
      return;
    }

    const isAlreadySelected = this.selectedClients.some((selected) => selected.id === client.id);
    if (isAlreadySelected) {
      this.toastrService.warning('Client is already selected.');
      this.clientInput.setValue('', { emitEvent: false });
      return;
    }

    this.selectedClients = [...this.selectedClients, client];
    this.clientInput.setValue('', { emitEvent: true });
  }

  removeClient(clientId: string): void {
    this.selectedClients = this.selectedClients.filter((client) => client.id !== clientId);
    this.clientInput.updateValueAndValidity({ emitEvent: true });
  }

  ngAfterViewInit(): void {
    this.sub$.sink = this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
    });
    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.filterParamters.skip =
            this.paginator.pageIndex * this.paginator.pageSize;
          this.filterParamters.pageSize = this.paginator.pageSize;
          this.filterParamters.orderBy =
            (this.sort.active ?? "createdDate") + ' ' + (this.sort.direction ?? "desc");
          this.getAllFileRequests(this.filterParamters);
        })
      ).subscribe();
  }
}
