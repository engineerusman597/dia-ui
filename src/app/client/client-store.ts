import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Client } from './model/client';
import { ClientResource } from './model/client-resource';
import { ClientService } from './services/client.service';

type ClientState = {
  clientList: Client[];
  client: Client;
  loadList: boolean;
  isAddUpdate: boolean;
  filterParameters: ClientResource;
};

export const initialClientState: ClientState = {
  clientList: [],
  client: {} as Client,
  loadList: true,
  isAddUpdate: false,
  filterParameters: {
    orderBy: 'createdDate asc',
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
    assignTo: '',
  } as ClientResource,
};

export const ClientStore = signalStore(
  { providedIn: 'root' },
  withState(initialClientState),
  withMethods(
    (
      store,
      clientService = inject(ClientService),
      toastrService = inject(ToastrService)
    ) => {
      return ({
        loadByQuery: rxMethod<ClientResource>(
          pipe(
            tap(() => patchState(store, { clientList: [] })),
            switchMap((filter) => {
              return clientService.getClients(filter).pipe(
                tapResponse({
                  next: (httpResponse) => {
                    const clients = httpResponse as HttpResponse<Client[]>;
                    if (clients) {
                      if (clients && clients.body) {
                        patchState(store, {
                          clientList: [...clients.body],
                          loadList: false,
                        });
                      }
                      if (clients.headers.get('x-pagination')) {
                        const pagination: ClientResource = JSON.parse(
                          clients.headers.get('x-pagination') ?? ''
                        );
                        patchState(store, {
                          filterParameters: {
                            ...filter,
                            totalCount: pagination.totalCount,
                          },
                        });
                      }
                    }
                  },
                  error: (error: any) => {
                    console.error(error);
                  },
                })
              );
            })
          )
        ),
        addClient: rxMethod<Client>(
          pipe(
            distinctUntilChanged(),
            tap(() => patchState(store, { loadList: false })),
            switchMap((client: Client) => clientService.addClient(client).pipe(
              tapResponse({
                next: (addClient) => {
                  toastrService.success('Client created successfully');
                  patchState(store, { isAddUpdate: true, loadList: true, client: addClient as Client });
                },
                error: (error: any) => {
                  console.error(error);
                },
              })
            )
            )
          )
        ),
        updateClient: rxMethod<Client>(
          pipe(
            distinctUntilChanged(),
            tap(() => patchState(store, { loadList: false })),
            switchMap((updateClient: Client) => clientService
              .updateClient(updateClient)
              .pipe(
                tapResponse({
                  next: (response) => {
                    const updatedClient: Client = response as Client;
                    toastrService.success('Client updated successfully');
                    patchState(store, {
                      client: updatedClient,
                      isAddUpdate: true,
                    });
                  },
                  error: (error: any) => {
                    console.error(error);
                  }
                })
              )
            )
          )
        ),
        deleteClient: rxMethod<string>(
          pipe(
            distinctUntilChanged(),
            tap(() => patchState(store, { loadList: false })),
            switchMap((clientId: string) => clientService.deleteClient(clientId).pipe(
              tapResponse({
                next: () => {
                  toastrService.success('Client deleted successfully');
                  patchState(store, {
                    clientList: store
                      .clientList()
                      .filter((w) => w.id !== clientId),
                    filterParameters: {
                      ...store.filterParameters(),
                      totalCount: store.filterParameters().totalCount - 1,
                    },
                  });
                },
                error: (error: any) => {
                  console.error(error.error);
                },
              })
            )
            )
          )
        ),
        resetLoadListFlag() {
          patchState(store, { loadList: true });
        },
        resetflag() {
          patchState(store, { isAddUpdate: false });
        },
      });
    }
  ),

  withHooks({
    onInit(store) {
      toObservable(store.loadList).subscribe((flag) => {
        if (flag) {
          store.loadByQuery(store.filterParameters());
        }
      });
    },
  })
);
