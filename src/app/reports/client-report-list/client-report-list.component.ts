import { NgClass } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, inject, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ClientReportMode } from '../model/client-report-mode';
import { ClientReportResource } from '../model/client-report-resource';
import { ReportsService } from '../reports.service';
import { ClientReportRow } from '../model/client-report';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, merge, Subject, tap } from 'rxjs';
import { RequestStatus } from 'src/app/client/model/request-status';
import { PipesModule } from '@shared/pipes/pipes.module';
import { MatSelectModule } from '@angular/material/select';
import { BaseComponent } from 'src/app/base.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpResponse } from '@angular/common/http';
import { ClientService } from 'src/app/client/services/client.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IdName } from '@core/domain-classes/id-name';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-client-report-core',
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        NgClass,
        PipesModule,
        MatSelectModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatAutocompleteModule
    ],
    templateUrl: './client-report-list.component.html',
    styleUrl: './client-report-list.component.scss',
})
export class ClientReportCoreComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() mode: ClientReportMode = ClientReportMode.View;
    @Input() fromDate: Date | null = null;
    @Input() toDate: Date | null = null;
    @Input() assignToId: string | null = null;
    @Input() name: string | null = null;
    @Output() closeDialog = new EventEmitter<void>();

    displayedColumns: string[] = [
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
    displayedColumnSec: string[] = [
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

    resource: ClientReportResource = {
        orderBy: 'name asc',
        pageSize: 10,
        skip: 0,
        totalCount: 0,
        name: '',
        email: '',
        policyNumber: '',
        createdDateFrom: null,
        createdDateTo: null,
        countryOfOrigin: '',
        countryOfResidence: '',
        identityProofStatus: null,
        addressProofStatus: null,
        isDocumentsFullyApproved: null,
        assignTo: ''
    };


    readonly reportModes = ClientReportMode;
    clients: ClientReportRow[] = [];
    assignToList: IdName[] = [];
    assignToSearchControl = new FormControl('');
    footerToDisplayed: string[] = ['footer'];
    pageOption = [10, 20, 30, 40];
    downloading = false;

    clientService = inject(ClientService);
    toastService = inject(ToastrService);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort) sort?: MatSort;

    get dialogTitle(): string | null {
        if (this.mode === ClientReportMode.Completed) {
            return 'Completed Clients';
        }

        if (this.mode === ClientReportMode.Pending) {
            return 'Pending Clients';
        }

        if (this.mode === ClientReportMode.View) {
            return 'Clients';
        }

        if (this.mode === ClientReportMode.Total) {
            return 'Total Clients';
        }

        return null;
    }

    documentStatus = Object.values(RequestStatus).filter((v) => typeof v === 'number') as number[];
    documentStatusEnum = RequestStatus;

    filterParameter$: Subject<string> = new Subject<string>();
    _nameFilter = this.resource.name;
    _emailFilter = this.resource.email;
    _policyNumberFilter = this.resource.policyNumber;
    _countryOfOriginFilter = this.resource.countryOfOrigin;
    _countryOfResidenceFilter = this.resource.countryOfResidence as string;
    _identityProofStatusFilter = this.resource.identityProofStatus as number | null;
    _addressProofStatusFilter = this.resource.addressProofStatus as number | null;
    _createdDateFromFilter = this.resource.createdDateFrom;
    _createdDateToFilter = this.resource.createdDateTo;

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
        return this._identityProofStatusFilter as unknown as number | null;
    }

    public set identityProofStatusFilter(v: number | null) {
        if (this._identityProofStatusFilter !== v) {
            this._identityProofStatusFilter = v as number;
            const identityProofStatusFilter = `identityProofStatus#${v}`;
            this.filterParameter$.next(identityProofStatusFilter);
        }
    }

    public get addressProofStatusFilter(): number | null {
        return this._addressProofStatusFilter as unknown as number | null;
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
        return this._createdDateFromFilter;
    }

    public set createdDateFromFilter(v: Date | null) {
        if (this._createdDateFromFilter !== v) {
            this._createdDateFromFilter = v;
            const createdDateFromFilter = `createdDateFrom#${v ? v.toLocaleDateString() : ''}`;
            this.filterParameter$.next(createdDateFromFilter);
        }
    }

    public get createdDateToFilter(): Date | null {
        return this._createdDateToFilter;
    }

    public set createdDateToFilter(v: Date | null) {
        if (this._createdDateToFilter !== v) {
            this._createdDateToFilter = v;
            const createdDateToFilter = `createdDateTo#${v ? v.toLocaleDateString() : ''}`;
            this.filterParameter$.next(createdDateToFilter);
        }
    }

    constructor(
        private reportsService: ReportsService
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializeResource();
        this.onAssignToInput();
        this.applyFilter();
        this.setupAssignToControl();
    }

    private setupAssignToControl(): void {
        if (this.mode !== ClientReportMode.Assigned) {
            this.loadClients(this.resource);
            this.assignToSearchControl.enable({ emitEvent: false });
        } else {
            this.assignToSearchControl.disable({ emitEvent: false });
        }
    }

    private applyFilter(): void {
        this.sub$.sink = this.filterParameter$
            .pipe(debounceTime(1000), distinctUntilChanged())
            .subscribe((c: string) => {
                this.resource.skip = 0;
                this.paginator!.pageIndex = 0;
                const filterArray: Array<string> = c.split('#');
                if (filterArray[0] === 'name') {
                    this.resource.name = filterArray[1];
                } else if (filterArray[0] === 'email') {
                    this.resource.email = filterArray[1];
                } else if (filterArray[0] === 'policyNumber') {
                    this.resource.policyNumber = filterArray[1];
                } else if (filterArray[0] === 'countryOfOrigin') {
                    this.resource.countryOfOrigin = filterArray[1];
                } else if (filterArray[0] === 'countryOfResidence') {
                    this.resource.countryOfResidence = filterArray[1];
                } else if (filterArray[0] === 'identityProofStatus') {
                    this.resource.identityProofStatus = filterArray[1] !== '' ? Number(filterArray[1]) : null;
                } else if (filterArray[0] === 'addressProofStatus') {
                    this.resource.addressProofStatus = filterArray[1] !== '' ? Number(filterArray[1]) : null;
                } else if (filterArray[0] === 'assignTo') {
                    this.resource.assignTo = filterArray[1];
                } else if (filterArray[0] === 'createdDateFrom') {
                    if (filterArray[1] && filterArray[1] !== 'null' && !isNaN(Date.parse(filterArray[1]))) {
                        this.resource.createdDateFrom = new Date(filterArray[1]);
                        this.resource.createdDateTo = this.createdDateToFilter;
                    } else {
                        this.resource.createdDateFrom = null;
                        this.resource.createdDateTo = null;
                    }
                } else if (filterArray[0] === 'createdDateTo') {
                    if (filterArray[1] && filterArray[1] !== 'null' && !isNaN(Date.parse(filterArray[1]))) {
                        this.resource.createdDateFrom = this.createdDateFromFilter;
                        this.resource.createdDateTo = new Date(filterArray[1]);
                    } else {
                        this.resource.createdDateFrom = null;
                        this.resource.createdDateTo = null;
                    }
                }
                if (this.mode === ClientReportMode.Assigned && !this.assignToId) {
                    this.toastService.error('Please select a user to view the assigned clients');
                    return;
                }
                this.loadClients(this.resource);
            });
    }

    private initializeResource(): void {
        this.resource.isDocumentsFullyApproved =
            this.mode === ClientReportMode.Completed ? true :
                this.mode === ClientReportMode.Pending ? false : null;

        if (this.mode === ClientReportMode.View) {
            this.resource.createdDateFrom = this.fromDate;
            this.resource.createdDateTo = this.toDate;
            this.createdDateFromFilter = this.fromDate;
            this.createdDateToFilter = this.toDate;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['assignToId']?.currentValue != null) {
            this.assignToSearchControl.setValue(this.name ?? '', { emitEvent: false });
            this.filterParameter$.next(`assignTo#${this.assignToId}`);
        }
    }

    private loadClients(resource: ClientReportResource): void {
        this.reportsService.getReportClients(this.mode, resource).subscribe({
            next: (response) => {
                const data = response as HttpResponse<ClientReportRow[]>;
                if (data) {
                    this.clients = data.body || [];

                    if (data.headers.get('x-pagination')) {
                        const pagination = JSON.parse(data.headers.get('x-pagination')!);
                        this.resource.totalCount = pagination.totalCount;
                    }
                }
            },
            error: () => {
                this.clients = [];
                this.resource.totalCount = 0;
            },
        });
    }

    clearfromDates(): void {
        this.createdDateFromFilter = null;
        this.createdDateToFilter = null;
    }

    ngAfterViewInit(): void {
        this.sub$.sink = this.sort?.sortChange.subscribe(() => {
            this.paginator!.pageIndex = 0;
        });
        this.sub$.sink = merge(this.sort!.sortChange, this.paginator!.page)
            .pipe(
                tap(() => {
                    this.resource.skip =
                        (this.paginator?.pageIndex ?? 0) * (this.paginator?.pageSize ?? 10);
                    this.resource.pageSize = this.paginator?.pageSize ?? 10;
                    this.resource.orderBy =
                        (this.sort?.active ?? "name") + ' ' + (this.sort?.direction ?? "asc");
                    this.loadClients(this.resource);
                })
            ).subscribe();
    }

    downloadCsv(): void {
        this.downloading = true;
        this.reportsService.downloadCsv(this.mode, this.createdDateFromFilter?.toLocaleDateString() ?? '', this.createdDateToFilter?.toLocaleDateString() ?? '').subscribe({
            next: (response) => {
                const data = response as HttpResponse<Blob>;
                if (data) {
                    const fileName = this.mode === ClientReportMode.Completed ? 'completed-clients.csv'
                        : this.mode === ClientReportMode.Pending ? 'pending-clients.csv'
                            : 'total-clients.csv';
                    const blob = data.body;

                    if (!blob) {
                        this.downloading = false;
                        return;
                    }

                    const fileUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(fileUrl);

                    this.downloading = false;
                }
            },
            error: () => {
                this.downloading = false;
            },
        });
    }

    close(): void {
        this.closeDialog.emit();
    }

    onAssignToSelected(user: IdName): void {
        if (user?.id) {
            this.filterParameter$.next(`assignTo#${user.id}`);
            this.assignToSearchControl.setValue(`${user.name}`);
        }
    }

    onAssignToInput(): void {
        this.sub$.sink = this.assignToSearchControl.valueChanges
            .pipe(debounceTime(500), distinctUntilChanged())
            .subscribe((value: any) => {
                const v = value?.id ? `${value.name}` : value;
                if (value) {
                    this.sub$.sink = this.clientService.getSupportUsersForDropDown(v ?? '').subscribe({
                        next: (response) => {
                            if (response && response.body) {
                                this.assignToList = response.body;
                            }
                        }
                    });
                } else {
                    this.assignToList = [];
                    this.filterParameter$.next(`assignTo#`);
                }
            });
    }
}
