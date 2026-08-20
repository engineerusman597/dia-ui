import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable()
export class SignalrService {
  private hubConnection: signalR.HubConnection
  private _userNotification$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public get connectionId(): string {
    return this.hubConnection.connectionId;
  }

  public get userNotification$(): Observable<string> {
    return this._userNotification$.asObservable();
  }

  public startConnection(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const host = location.host;
      const protocal = location.protocol;
      const url = environment.apiUrl === '/' ? `${protocal}//${host}/` : environment.apiUrl;

      //   this.hubConnection = new signalR.HubConnectionBuilder()
      //     .withUrl(`${url}userHub`)
      //     .build();
      //   this.hubConnection
      //     .start()
      //     .then(() => {
      //       resolve(true)
      //     })
      //     .catch(err => {
      //       reject(false);
      //     });
    });
  }


  handleMessage = () => {
    this.hubConnection.on('userLeft', (id: string) => {
    });

    this.hubConnection.on('sendNotification', (userId: string) => {
      this._userNotification$.next(userId);
    });
  }

  forceLogout(id: string) {
    this.hubConnection.invoke('forceLogout', id)
      .catch(err => console.error(err));
  }
}
