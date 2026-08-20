import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { BaseComponent } from '../base.component';
import { ClientService } from '../client/services/client.service';
import { IdName } from '@core/domain-classes/id-name';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Client } from '../client/model/client';
import { MatSelectModule } from '@angular/material/select';
import { ClientStore } from '../client/client-store';

@Component({
    selector: 'app-bulk-assign-clients',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule
    ],
    templateUrl: './bulk-assign-clients.component.html',
    styleUrl: './bulk-assign-clients.component.scss'
})
export class BulkAssignClientsComponent extends BaseComponent implements OnInit {
    clientService = inject(ClientService);
    toastrService = inject(ToastrService);
    clientStore = inject(ClientStore);

    clientSearchControl = new FormControl<string>('');
    assignToControl = new FormControl<string>('', { validators: [Validators.required] });
    assignToSearchControl = new FormControl<string>('');
    fromAssignControl = new FormControl<string>('', { validators: [Validators.required] });
    fromAssignSearchControl = new FormControl<string>('');
    toAssignControl = new FormControl<string>('', { validators: [Validators.required] });
    toAssignSearchControl = new FormControl<string>('');

    supportUsers: IdName[] = [];
    fromTransferSupportUsers: IdName[] = [];
    toTransferSupportUsers: IdName[] = [];
    filteredClients: IdName[] = [];
    selectedClients: IdName[] = [];

    isSubmitting = false;
    isTransferring = false;

    get selectedFromUser() {
        return this.fromTransferSupportUsers.find(
            u => u.id === this.fromAssignControl.value
        ) || null;
    }

    get selectedToUser() {
        return this.toTransferSupportUsers.find(
            u => u.id === this.toAssignControl.value
        ) || null;
    }

    ngOnInit(): void {
        this.loadSupportUsers();
        this.loadFormTransferSupportUsers();
        this.loadToTransferSupportUsers();
        this.setupSupportUserSearches();
        this.setupClientSearch();
        this.setupAssignToChangeListener();
    }

    setupAssignToChangeListener(): void {
        this.sub$.sink = this.assignToControl.valueChanges.subscribe(() => {
            this.selectedClients = [];
            this.filteredClients = [];
            this.clientSearchControl.setValue('', { emitEvent: false });
        });
    }

    private loadFormTransferSupportUsers(): void {
        this.clientService.getSupportUsersForTransferDropDown('', true).subscribe({
            next: (resp) => {
                this.fromTransferSupportUsers = [...(resp as HttpResponse<IdName[]>).body ?? []];
            }
        });
    }

    private loadToTransferSupportUsers(): void {
        this.clientService.getSupportUsersForTransferDropDown('').subscribe({
            next: (resp) => {
                this.toTransferSupportUsers = [...(resp as HttpResponse<IdName[]>).body ?? []];
            }
        });
    }

    private loadSupportUsers(): void {
        this.clientService.getSupportUsersForDropDown('', true).subscribe({
            next: (resp) => {
                const users = resp as HttpResponse<IdName[]>;
                this.supportUsers = users.body ?? [];
            }
        });
    }

    setupSupportUserSearches(): void {
        this.setupSupportUserSearch(this.fromAssignSearchControl, (users) => {
            this.fromTransferSupportUsers = users;
        }, true);

        this.setupSupportUserSearch(this.toAssignSearchControl, (users) => {
            this.toTransferSupportUsers = users;
        });

        this.setupSupportUserSearch(this.assignToSearchControl, (users) => {
            this.supportUsers = users;
        });
    }

    setupSupportUserSearch(control: FormControl<string | null>, setUsers: (users: IdName[]) => void, isIncluded?: boolean,): void {
        this.sub$.sink = control.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap((c) => {
                    return this.clientService.getSupportUsersForTransferDropDown(c || '', isIncluded);
                })
            )
            .subscribe((resp) => {
                if (resp) {
                    const users = (resp as HttpResponse<IdName[]>).body ?? [];
                    setUsers([...users]);
                }
            });
    }

    clearFilter(control: FormControl): void {
        if (control.value) {
            control.setValue('');
        }
    }

    setupClientSearch(): void {
        this.sub$.sink = this.clientSearchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((query) => {
                    const assignToId = this.assignToControl.value ?? '';
                    if (!assignToId) {
                        this.filteredClients = [];
                        this.toastrService.warning('Please select Assigned To user before searching clients.');
                        return of(null);
                    }

                    return this.clientService.getAssignClientsForDropDown(assignToId, query ?? '');
                })
            )
            .subscribe((resp) => {
                if (!resp) {
                    return;
                }

                const clients = (resp as HttpResponse<Client[]>).body ?? [];
                this.filteredClients = [...clients];
            });
    }

    onClientSelected(event: MatAutocompleteSelectedEvent): void {
        const client = event.option.value as Client;
        if (!client) {
            return;
        }

        const isAlreadySelected = this.selectedClients.some((selected) => selected.id === client.id);
        if (isAlreadySelected) {
            this.toastrService.warning('Client is already selected.');
            this.clientSearchControl.setValue('', { emitEvent: false });
            return;
        }

        this.selectedClients = [...this.selectedClients, client];
        this.clientSearchControl.setValue('', { emitEvent: true });
    }

    removeClient(clientId: string): void {
        this.selectedClients = this.selectedClients.filter((client) => client.id !== clientId);
    }

    submitTransferClients(): void {
        if (this.fromAssignControl.invalid || this.toAssignControl.invalid) {
            this.fromAssignControl.markAsTouched();
            this.toAssignControl.markAsTouched();
            // this.toastrService.error('Please select both From and To users.');
            return;
        }

        const fromAssignId = this.fromAssignControl.value ?? '';
        const toAssignId = this.toAssignControl.value ?? '';

        if (fromAssignId === toAssignId) {
            this.toastrService.error('From and To users cannot be the same.');
            return;
        }

        if (this.selectedFromUser?.clientCount === 0) {
            this.toastrService.warning('Selected From user has no clients to transfer.');
            return;
        }

        this.isTransferring = true;
        this.clientService.transferClients(fromAssignId, toAssignId).subscribe({
            next: () => {
                this.clientStore.resetLoadListFlag();
                this.loadFormTransferSupportUsers();
                this.loadToTransferSupportUsers();
                this.toastrService.success('Clients transferred successfully.');
                this.fromAssignControl.setValue('', { emitEvent: false });
                this.toAssignControl.setValue('', { emitEvent: false });
            },
            complete: () => {
                this.isTransferring = false;
            }
        });
    }

    submitAssignClients(): void {
        if (this.assignToControl.invalid) {
            this.assignToControl.markAsTouched();
            this.toastrService.error('Please select Assigned To user.');
            return;
        }

        const assignToId = this.assignToControl.value ?? '';

        if (!assignToId) {
            this.toastrService.error('Please select Assigned To user.');
            return;
        }

        if (this.selectedClients.length === 0) {
            this.toastrService.error('Please select at least one client.');
            return;
        }

        const clientIds = this.selectedClients.map((client) => client.id);

        this.isSubmitting = true;
        this.clientService.assignClients(assignToId, clientIds).subscribe({
            next: () => {
                this.clientStore.resetLoadListFlag();
                this.loadFormTransferSupportUsers();
                this.loadToTransferSupportUsers();
                this.toastrService.success('Clients assigned successfully.');
                this.selectedClients = [];
                this.filteredClients = [];
                this.assignToControl.setValue('', { emitEvent: false });
                this.clientSearchControl.setValue('', { emitEvent: false });
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }
}
