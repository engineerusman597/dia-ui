import { Injectable, NgZone } from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { SecurityService } from '@core/security/security.service';

@Injectable({
  providedIn: 'root'
})
export class IdleService {

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = new Date();

  constructor(
    private idle: Idle,
    private keepalive: Keepalive,
    private securityService: SecurityService,
    private ngZone: NgZone,
  ) {
    // ⚡ Idle time (10 min)
    this.idle.setIdle(600);

    // ⚡ Timeout countdown (1 min warning)
    this.idle.setTimeout(60);

    // Interrupt sources (click, scroll, etc.)
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // Events
    this.idle.onIdleStart.subscribe(() => {
      this.idleState = 'User is idle!';
      console.log('Idle started');
    });

    this.idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
      console.log('Idle ended');
    });

    this.idle.onTimeoutWarning.subscribe((countdown: number) => {
      console.log(`Session will expire in ${countdown} seconds`);
    });

    this.idle.onTimeout.subscribe(() => {
      this.ngZone.run(() => {
        this.idleState = 'Timed out!';
        this.timedOut = true;
        console.log('Session timed out');
        this.logout();
      });
    });

    // Optional: keepalive ping
    this.keepalive.interval(15); // seconds
    this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.reset();
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  stop() {
    this.idle.stop();
  }

  logout() {
    this.stop();
    this.securityService.logout();
  }
}
