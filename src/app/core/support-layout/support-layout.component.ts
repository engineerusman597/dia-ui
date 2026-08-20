import { Component, OnInit } from '@angular/core';
import { LoadingIndicatorModule } from "@shared/loading-indicator/loading-indicator.module";
import { Router, RouterOutlet, ActivatedRoute, NavigationEnd, RouterModule } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { filter, startWith } from 'rxjs/operators';
import { SecurityService } from '@core/security/security.service';

@Component({
  selector: 'app-support-layout',
  standalone: true,
  imports: [LoadingIndicatorModule, RouterOutlet, RouterModule, MatIconModule],
  templateUrl: './support-layout.component.html',
  styleUrl: './support-layout.component.css'
})
export class SupportLayoutComponent implements OnInit {
  supportUserId: string | null = null;

  get isUploadDocumentRoute(): boolean {
    return !!this.router.url.startsWith('/support/upload-document');
  }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly securityService: SecurityService
  ) { }

  ngOnInit(): void {
    this.securityService.setBearerToken('');
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null)
      )
      .subscribe(() => this.resolveSupportUserId());
  }

  onLogout(): void {
    this.securityService.logout();
  }

  private resolveSupportUserId(): void {
    let activeRoute = this.route;

    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    const routeId = activeRoute.snapshot.paramMap.get('id');
    const queryUserId = activeRoute.snapshot.queryParamMap.get('userId');
    const claimUserId = this.securityService.Claims?.['sub'] ?? null;

    this.supportUserId = routeId || queryUserId || claimUserId;
  }
}
