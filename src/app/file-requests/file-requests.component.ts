
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { FileRequest } from './model/file-request';
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

  sendRequest() {
    if (!this.isAll && this.selectedClients.length === 0) {
      this.toastrService.error('Please select at least one client or choose "Request All".');
      return;
    }
    if (this.isAll) {
      this.fileService.updateFileRequest({ clientIds: [], isAll: this.isAll }).subscribe({
        next: () => {
          this.toastrService.success('Request sent to all clients.');
          this.resetFileRequest();
          this.getAllFileRequests(this.filterParamters);
        }
      });
    } else if (this.selectedClients.length > 0) {
      const clientIds = this.selectedClients.map(c => c.id);
      this.fileService.updateFileRequest({ clientIds, isAll: this.isAll }).subscribe({
        next: () => {
          const names = this.selectedClients.map(c => c.name).join(', ');
          this.toastrService.success('Request sent to: ' + names);
          this.resetFileRequest();
          this.getAllFileRequests(this.filterParamters);
        }
      });
    }
  }

  resetFileRequest() {
    this.isAll = false;
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
