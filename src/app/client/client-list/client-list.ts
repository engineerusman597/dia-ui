import { NgClass, NgFor } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { BaseComponent } from '../../base.component';
import { ClientStore } from '../client-store';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, merge, Subject, tap } from 'rxjs';
import { PipesModule } from '@shared/pipes/pipes.module';
import { RequestStatus } from '../model/request-status';
import { ClientService } from '../services/client.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IdName } from '@core/domain-classes/id-name';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatPaginator,
    MatSelectModule,
    MatSortModule,
    FormsModule,
    PipesModule,
    MatCardModule,
    NgFor,
    NgClass,
    MatDatepickerModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
})
export class ClientList
  extends BaseComponent
  implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'action',
    'name',
    'policyNumber',
    'email',
    'assignToName',
    'identityProofStatus',
    'addressProofStatus',
    'createdDate',
    'relationship',
    'dateOfBirth',
    'countryOfOrigin',
    'trim',
    'physicalAddress',
    'gender',
    'commencementDate',
    'premiumPayableTo'
  ];
  displayedColumnSecondary: string[] = [
    'search-action',
    'search-name',
    'search-policyNumber',
    'search-email',
    'search-assignToName',
    'search-identityProofStatus',
    'search-addressProofStatus',
    'search-createdDate',
    'search-relationship',
    'search-dateOfBirth',
    'search-countryOfOrigin',
    'search-trim',
    'search-physicalAddress',
    'search-gender',
    'search-commencementDate',
    'search-premiumPayableTo'
  ];
  readonly filterParameters = computed(() =>
    this.clientStore.filterParameters()
  );
  footerToDisplayed: string[] = ['footer'];
  clientStore = inject(ClientStore);
  clientService = inject(ClientService);
  commonDialogService = inject(CommonDialogService);
  toastrService = inject(ToastrService);
  pageOption = [10, 20, 30, 40];
  assignToList: IdName[] = [];
  assignToSearchControl = new FormControl('');
  clientFilterParameter = { ...this.clientStore.filterParameters() };
  filterParameter$: Subject<string> = new Subject<string>();
  _nameFilter = this.clientFilterParameter.name;
  _emailFilter = this.clientFilterParameter.email;
  _policyNumberFilter = this.clientFilterParameter.policyNumber;
  _countryOfOriginFilter = this.clientFilterParameter.countryOfOrigin;
  _countryOfResidenceFilter = this.clientFilterParameter.countryOfResidence;
  _identityProofStatusFilter = this.clientFilterParameter.identityProofStatus;
  _addressProofStatusFilter = this.clientFilterParameter.addressProofStatus;
  _createdDateFromFilter = this.clientFilterParameter.createdDateFrom;
  _createdDateToFilter = this.clientFilterParameter.createdDateTo;

  documentStatus = Object.values(RequestStatus).filter((v) => typeof v === 'number') as number[];
  documentStatusEnum = RequestStatus;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public get nameFilter(): string {
    return this._nameFilter as string;
  }

  public set nameFilter(v: string) {
    if (this._nameFilter !== v) {
      this._nameFilter = v;
      const nameFilter = `name#${v}`;
      this.filterParameter$.next(nameFilter);
    }
  }

  public get identityProofStatusFilter(): number | null {
    return this._identityProofStatusFilter;
  }

  public set identityProofStatusFilter(v: number | null) {
    if (this._identityProofStatusFilter !== v) {
      this._identityProofStatusFilter = v as number;
      const identityProofStatusFilter = `identityProofStatus#${v}`;
      this.filterParameter$.next(identityProofStatusFilter);
    }
  }

  public get addressProofStatusFilter(): number | null {
    return this._addressProofStatusFilter;
  }

  public set addressProofStatusFilter(v: number | null) {
    if (this._addressProofStatusFilter !== v) {
      this._addressProofStatusFilter = v as number;
      const addressProofStatusFilter = `addressProofStatus#${v}`;
      this.filterParameter$.next(addressProofStatusFilter);
    }
  }

  public get emailFilter(): string {
    return this._emailFilter as string;
  }

  public set emailFilter(v: string) {
    if (this._emailFilter !== v) {
      this._emailFilter = v;
      const emailFilter = `email#${v}`;
      this.filterParameter$.next(emailFilter);
    }
  }

  public get policyNumberFilter(): string {
    return this._policyNumberFilter as string;
  }


  public set policyNumberFilter(v: string) {
    if (this._policyNumberFilter !== v) {
      this._policyNumberFilter = v;
      const policyNumberFilter = `policyNumber#${v}`;
      this.filterParameter$.next(policyNumberFilter);
    }
  }

  public get countryOfOriginFilter(): string {
    return this._countryOfOriginFilter as string;
  }

  public set countryOfOriginFilter(v: string) {
    if (this._countryOfOriginFilter !== v) {
      this._countryOfOriginFilter = v;
      const countryOfOriginFilter = `countryOfOrigin#${v}`;
      this.filterParameter$.next(countryOfOriginFilter);
    }
  }

  public get countryOfResidenceFilter(): string {
    return this._countryOfResidenceFilter as string;
  }

  public set countryOfResidenceFilter(v: string) {
    if (this._countryOfResidenceFilter !== v) {
      this._countryOfResidenceFilter = v;
      const countryOfResidenceFilter = `countryOfResidence#${v}`;
      this.filterParameter$.next(countryOfResidenceFilter);
    }
  }

  public get createdDateFromFilter(): Date | null {
    return this._createdDateFromFilter as Date | null;
  }

  public set createdDateFromFilter(v: Date | null) {
    if (this._createdDateFromFilter !== v) {
      this._createdDateFromFilter = v;
      const createdDateFromFilter = `createdDateFrom#${v ? v.toLocaleDateString() : ''}`;
      this.filterParameter$.next(createdDateFromFilter);
    }
  }

  public get createdDateToFilter(): Date | null {
    return this._createdDateToFilter as Date | null;
  }

  public set createdDateToFilter(v: Date | null) {
    if (this._createdDateToFilter !== v) {
      this._createdDateToFilter = v;
      const createdDateToFilter = `createdDateTo#${v ? v.toLocaleDateString() : ''}`;
      this.filterParameter$.next(createdDateToFilter);
    }
  }

  ngOnInit(): void {
    this.onAssignToInput();

    this.sub$.sink = this.filterParameter$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((c: string) => {
        this.clientFilterParameter.skip = 0;
        this.paginator.pageIndex = 0;
        const filterArray: Array<string> = c.split('#');
        if (filterArray[0] === 'name') {
          this.clientFilterParameter.name = filterArray[1];
        } else if (filterArray[0] === 'email') {
          this.clientFilterParameter.email = filterArray[1];
        } else if (filterArray[0] === 'policyNumber') {
          this.clientFilterParameter.policyNumber = filterArray[1];
        } else if (filterArray[0] === 'countryOfOrigin') {
          this.clientFilterParameter.countryOfOrigin = filterArray[1];
        } else if (filterArray[0] === 'countryOfResidence') {
          this.clientFilterParameter.countryOfResidence = filterArray[1];
        } else if (filterArray[0] === 'identityProofStatus') {
          this.clientFilterParameter.identityProofStatus = filterArray[1] !== '' ? Number(filterArray[1]) : null;
        } else if (filterArray[0] === 'addressProofStatus') {
          this.clientFilterParameter.addressProofStatus = filterArray[1] !== '' ? Number(filterArray[1]) : null;
        } else if (filterArray[0] === 'assignTo') {
          this.clientFilterParameter.assignTo = filterArray[1];
        } else if (filterArray[0] === 'createdDateFrom') {
          if (filterArray[1] && filterArray[1] !== 'null' && !isNaN(Date.parse(filterArray[1]))) {
            this.clientFilterParameter.createdDateFrom = new Date(filterArray[1]);
            this.clientFilterParameter.createdDateTo = this.createdDateToFilter;
          } else {
            this.clientFilterParameter.createdDateFrom = null;
            this.clientFilterParameter.createdDateTo = null;
          }
        } else if (filterArray[0] === 'createdDateTo') {
          if (filterArray[1] && filterArray[1] !== 'null' && !isNaN(Date.parse(filterArray[1]))) {
            this.clientFilterParameter.createdDateFrom = this.createdDateFromFilter;
            this.clientFilterParameter.createdDateTo = new Date(filterArray[1]);
          } else {
            this.clientFilterParameter.createdDateFrom = null;
            this.clientFilterParameter.createdDateTo = null;
          }
        }
        this.clientStore.loadByQuery(this.clientFilterParameter);
      });
  }

  refresh() {
    const defaults = {
      orderBy: 'name asc',
      pageSize: 30,
      skip: 0,
      totalCount: 0,
      name: '',
      email: '',
      policyNumber: '',
      countryOfOrigin: '',
      countryOfResidence: '',
      identityProofStatus: null,
      addressProofStatus: null,
      createdDateFrom: null,
      createdDateTo: null,
    };
    this.clientFilterParameter = { ...defaults };

    [
      ['_nameFilter', 'name'],
      ['_emailFilter', 'email'],
      ['_policyNumberFilter', 'policyNumber'],
      ['_countryOfOriginFilter', 'countryOfOrigin'],
      ['_countryOfResidenceFilter', 'countryOfResidence'],
      ['_identityProofStatusFilter', 'identityProofStatus'],
      ['_addressProofStatusFilter', 'addressProofStatus'],
      ['_createdDateFromFilter', 'createdDateFrom'],
      ['_createdDateToFilter', 'createdDateTo'],
    ].forEach(([field, key]) => {
      (this as any)[field] = (this.clientFilterParameter as any)[key];
    });
    this.assignToSearchControl.setValue('');

    this.clientStore.loadByQuery(this.clientFilterParameter);
  }

  deleteClient(id: string) {
    this.commonDialogService
      .deleteConformationDialog('Are you sure you want to delete this client?')
      .subscribe({
        next: (result: boolean) => {
          if (result) {
            this.clientStore.deleteClient(id);
          }
        },
      });
  }

  clearfromDates(): void {
    this.createdDateFromFilter = null;
    this.createdDateToFilter = null;
  }

  onAssignToSelected(user: IdName): void {
    if (user?.id) {
      this.filterParameter$.next(`assignTo#${user.id}`);
      this.assignToSearchControl.setValue(user.name, { emitEvent: false });
    }
  }

  onAssignToInput(): void {
    if (this.clientFilterParameter.assignTo) {
      this.sub$.sink = this.clientService.getSupportUsersForDropDown('', true).subscribe({
        next: (response) => {
          if (response && response.body) {
            this.assignToList = response.body;
            const assignedUser = this.assignToList.find(user => user.id === this.clientFilterParameter.assignTo);
            if (assignedUser) {
              this.assignToSearchControl.setValue(`${assignedUser.name}`);
            }
          }
        }
      });
    }

    this.initAssignToSearchStream();
  }

  private initAssignToSearchStream(): void {
    this.sub$.sink = this.assignToSearchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {

        if (typeof value !== 'string') {
          return;
        }

        const searchText = value.trim();

        if (!searchText) {
          this.assignToList = [];
          this.filterParameter$.next(`assignTo#`);
          return;
        }

        this.sub$.sink = this.clientService.getSupportUsersForDropDown(searchText ?? '').subscribe({
          next: (response) => {
            if (response && response.body) {
              this.assignToList = response.body;
            }
          }
        });
      });
  }

  ngAfterViewInit(): void {
    this.sub$.sink = this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });
    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.clientFilterParameter.skip =
            this.paginator.pageIndex * this.paginator.pageSize;
          this.clientFilterParameter.pageSize = this.paginator.pageSize;
          this.clientFilterParameter.orderBy =
            (this.sort.active ?? "name") + ' ' + (this.sort.direction ?? "asc");
          this.clientStore.loadByQuery(this.clientFilterParameter);
        })
      ).subscribe();
  }
}
