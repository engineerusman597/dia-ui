import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../client/services/client.service';
import { ToastrService } from 'ngx-toastr';
import { delay } from 'rxjs';

@Component({
  selector: 'app-client-request',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
      <div class="text-center">
        <img src="assets/images/DI-Logo.png" alt="DIASPORA INSURANCE" style="max-height:72px;margin-bottom:16px">
        <h2 style="color:#1D311C; font-weight:200;">KYC Compliance Portal</h2>
        <p class="text-muted mt-3">Verifying your request, please wait...</p>
        <div class="spinner-border text-success mt-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }
  `]
})
export class ClientRequestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private toastr = inject(ToastrService);
  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) {
      this.toastr.error('Invalid request link.');
      this.router.navigate(['/user-login']);
      return;
    }
    const obs = this.clientService.checkPasswordStatus(clientId);
    obs.pipe(
      delay(1500),
    ).subscribe({
      next: (result) => {
        const data = result as { resetPasswordToken: string, setPasswordFlag: boolean };
        if (data.setPasswordFlag) {
          this.router.navigate(['/login']);
        } else {
          this.router.navigate([`/set-password/${data.resetPasswordToken}`]);
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
