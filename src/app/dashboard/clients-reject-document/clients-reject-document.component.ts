import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { BaseComponent } from '../../base.component';
import { ClientRejectedDocumentStore } from './clients-reject-document-store';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, merge, Subject, tap } from 'rxjs';
import { RequestStatus } from '../../client/model/request-status';
import { FormControl } from '@angular/forms';
import { ClientService } from 'src/app/client/services/client.service';
import { IdName } from '@core/domain-classes/id-name';

@Component({
  selector: 'app-clients-reject-document',
  templateUrl: './clients-reject-document.component.html',
  styleUrls: ['./clients-reject-document.component.scss']
})
export class ClientsRejectDocumentComponent extends BaseComponent
  implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'policyNumber',
    'email',
    'assignToName',
    'identityProofStatus',
    'addressProofStatus',
    'gender',
    'relationship',
    'dateOfBirth',
    'countryOfOrigin',
    'physicalAddress',
    'commencementDate',
    'premiumPayableTo',
    'trim'
  ];
  displayedColumnSecondary: string[] = [
    'search-name',
    'search-policyNumber',
    'search-email',
    'search-assignToName',
    'search-identityProofStatus',
    'search-addressProofStatus',
    'search-gender',
    'search-relationship',
    'search-dateOfBirth',
    'search-countryOfOrigin',
    'search-physicalAddress',
    'search-commencementDate',
    'search-premiumPayableTo',
    'search-trim'
  ];
  readonly filterParameters = computed(() =>
    this.clientStore.filterParameters()
  );
  footerToDisplayed: string[] = ['footer'];
  commonDialogService = inject(CommonDialogService);
  toastrService = inject(ToastrService);
  clientStore = inject(ClientRejectedDocumentStore);
  clientService = inject(ClientService);
  pageOption = [10, 20, 30, 40];
  clientFilterParameter = { ...this.clientStore.filterParameters() };
  filterParameter$: Subject<string> = new Subject<string>();
  _nameFilter = this.clientFilterParameter.name;
  _emailFilter = this.clientFilterParameter.email;
  _policyNumberFilter = this.clientFilterParameter.policyNumber;
  _countryOfOriginFilter = this.clientFilterParameter.countryOfOrigin;
  _countryOfResidenceFilter = this.clientFilterParameter.countryOfResidence;

  documentStatusEnum = RequestStatus;
  assignToSearchControl = new FormControl();
  assignToList: IdName[] = [];

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
        } else if (filterArray[0] === 'assignTo') {
          this.clientFilterParameter.assignTo = filterArray[1];
        }
        this.clientStore.loadByQuery(this.clientFilterParameter);
      });
  }

  refresh() {
    const defaults = {
      orderBy: 'name asc',
      pageSize: 10,
      skip: 0,
      totalCount: 0,
      name: '',
      email: '',
      policyNumber: '',
      countryOfOrigin: '',
      countryOfResidence: '',
      identityProofStatus: null,
      addressProofStatus: null,
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
    ].forEach(([field, key]) => {
      (this as any)[field] = (this.clientFilterParameter as any)[key];
    });
    this.assignToSearchControl.setValue('', { emitEvent: false });

    this.clientStore.loadByQuery(this.clientFilterParameter);
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
            (this.sort.active ?? "modifiedDate") + ' ' + (this.sort.direction ?? "desc");
          this.clientStore.loadByQuery(this.clientFilterParameter);
        })
      ).subscribe();
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
              this.assignToSearchControl.setValue(assignedUser.name, { emitEvent: false });
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
}
