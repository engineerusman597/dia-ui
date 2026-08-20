import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnsubscribeEmailService } from './unsubscribe-email.service';
import { UnsubscribeReason } from './model/UnsubscribeReason';

@Component({
  selector: 'app-unsubscribe-email',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FeatherModule,
    ReactiveFormsModule
  ],
  templateUrl: './unsubscribe-email.component.html',
  styleUrl: './unsubscribe-email.component.scss'
})
export class UnsubscribeEmailComponent implements OnInit {
  loading = false;
  isUnsubscribed = false;
  error: string | null = null;
  token: string | null = null;
  unsubscribeForm!: FormGroup;

  reasons: UnsubscribeReason[] = [
    {
      value: 'too_many',
      label: 'Too Many Emails',
      description: `I am receiving too many emails from you`
    },
    {
      value: 'not_relevant',
      label: 'Not Relevant Anymore',
      description: 'The content is not relevant to me'
    },
    {
      value: 'no_longer_interested',
      label: 'No Longer Interested',
      description: 'I am no longer interested in the content'
    },
    {
      value: 'never_signed_up',
      label: 'Never Signed Up',
      description: 'I never signed up for this service'
    },
    {
      value: 'privacy_concerns',
      label: 'Privacy Concerns',
      description: 'I have concerns about my privacy and data security'
    },
    {
      value: 'other',
      label: 'Other',
      description: 'I have another reason for unsubscribing'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private unsubscribeEmailService: UnsubscribeEmailService,
  ) { }

  ngOnInit(): void {
    this.unsubscribeForm = this.fb.group({
      reason: ['', Validators.required],
      otherReason: ['']
    });

    this.unsubscribeForm.get('reason')?.valueChanges.subscribe(value => {
      const otherReasonControl = this.unsubscribeForm.get('otherReason');
      if (value === 'other') {
        otherReasonControl?.setValidators([Validators.required]);
      } else {
        otherReasonControl?.clearValidators();
      }
      otherReasonControl?.updateValueAndValidity();
    });
  }

  unsubscribe(): void {

    if (!this.unsubscribeForm.valid) {
      this.unsubscribeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = this.unsubscribeForm.value;
    const reason = formData.reason === 'other' ? formData.otherReason : formData.reason;
    const token = this.route.snapshot.paramMap.get('token');
    this.unsubscribeEmailService.addUnsubscribeReason(reason, token || '').subscribe({
      next: () => {
        this.isUnsubscribed = true;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }, complete: () => {
        this.loading = false;
        const message = 'Successfully unsubscribed';
        alert(message);
        this.close();
      }
    });
  }

  close(): void {
    window.close();
  }

}
