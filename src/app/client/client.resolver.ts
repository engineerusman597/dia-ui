import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { Client } from './model/client';
import { ClientService } from './services/client.service';

export const ClientResolver: ResolveFn<Client | undefined> = (
    route: ActivatedRouteSnapshot
) => {
    const clientService = inject(ClientService);
    const id = route.params['id'];
    if (id != null) {
        return clientService.getClient(id) as Observable<Client>;
    }
    return;
};
