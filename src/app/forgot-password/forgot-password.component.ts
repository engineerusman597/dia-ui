import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '../client/services/client.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})

export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private clientService = inject(ClientService);
    private toaster = inject(ToastrService);
    private router = inject(Router);

    submitting = false;
    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.submitting = true;

        const email = this.form.value.email;
        this.clientService.sendForgotPasswordEmail(email as string)
            .subscribe({
                next: (result) => {
                    if (result) {
                        this.toaster.success('Password reset email sent successfully.');
                    }
                    this.router.navigate(['/login']);
                    this.submitting = false;
                },
                error: () => {
                    this.submitting = false;
                }
            });
    }
}
