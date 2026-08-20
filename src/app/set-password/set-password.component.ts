import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../client/services/client.service';
import { ToastrService } from 'ngx-toastr';
import { UserType } from '@core/domain-classes/user-type';

@Component({
    selector: 'app-set-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './set-password.component.html',
    styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent {
    submitting = false;
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private clientService = inject(ClientService);
    private toastr = inject(ToastrService);

    clientId: string | null = null;

    form = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    });

    constructor() {
        this.clientId = this.route.snapshot.paramMap.get('id');
    }

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        if (this.form.value.password !== this.form.value.confirmPassword) {
            this.toastr.error('Passwords do not match.');
            return;
        }

        if (!this.clientId) {
            this.toastr.error('Invalid request. Client ID is missing.');
            return;
        }

        const password = this.form.get('password')?.value;

        this.submitting = true;
        this.clientService.setClientPassword(this.clientId, password || '').subscribe({
            next: (res) => {
                const userData = res as { bearerToken: string; clientId: string; userType: number };

                if (userData) {
                    let route = '';

                    switch (userData.userType) {
                        case UserType.Client:
                            route = `/upload-documents/${userData.clientId}`;
                            break;

                        case UserType.SuperAdmin:
                            route = '/dashboard';
                            break;

                        case UserType.SupportTeam:
                            route = `/support/upload-document/${userData.clientId}`;
                            break;

                        default:
                            route = '/';
                    }
                    this.router.navigate([route]);
                    this.toastr.success('Password set successfully.');
                }
            },
            error: () => {
                this.submitting = false;
            }
        });
    }
}
