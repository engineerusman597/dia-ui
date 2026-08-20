import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Client } from 'src/app/client/model/client';
import { ClientResource } from 'src/app/client/model/client-resource';
import { ClientService } from 'src/app/client/services/client.service';

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
    orderBy: 'modifiedDate desc',
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
  },
};

export const ClientRejectedDocumentStore = signalStore(
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
              return clientService.getClientsRejectedDocument(filter).pipe(
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
                    toastrService.error(error.error);
                  },
                })
              );
            })
          )
        ),
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
