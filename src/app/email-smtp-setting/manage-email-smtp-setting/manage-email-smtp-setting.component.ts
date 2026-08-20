import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailSMTPSetting } from '@core/domain-classes/email-smtp-setting';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { EmailSmtpSettingService } from '../email-smtp-setting.service';
import { CommonService } from '@core/services/common.service';

@Component({
  selector: 'app-manage-email-smtp-setting',
  templateUrl: './manage-email-smtp-setting.component.html',
  styleUrls: ['./manage-email-smtp-setting.component.scss']
})
export class ManageEmailSmtpSettingComponent extends BaseComponent implements OnInit {
  isEditMode: boolean = false;
  smtpSettingForm: UntypedFormGroup;
  smtpConfigured: boolean = false;

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private activeRoute: ActivatedRoute,
    private emailSmtpSettingService: EmailSmtpSettingService,
    private toastrService: ToastrService,
    private translationService: TranslationService,
    private commonService: CommonService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createEmailSMTPForm();
    this.sub$.sink = this.activeRoute.data.subscribe(
      (data: { smtpSetting: EmailSMTPSetting }) => {
        if (data.smtpSetting) {
          this.isEditMode = true;
          this.smtpSettingForm.patchValue(data.smtpSetting);
        }
      });

  }

  createEmailSMTPForm() {
    this.smtpSettingForm = this.fb.group({
      id: [''],
      host: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      encryptionType: [''],
      port: ['', [Validators.required]],
      isDefault: [false],
      fromEmail: ['', [Validators.required, Validators.email]],
      fromName: ['', [Validators.required]],
    });
  }

  saveEmailSMTPSetting() {
    if (this.smtpSettingForm.valid) {
      const emailSMTPSetting = this.smtpSettingForm.getRawValue();
      if (this.isEditMode) {
        this.sub$.sink = this.emailSmtpSettingService.updateEmailSMTPSetting(emailSMTPSetting).subscribe(() => {
          this.commonService.setIsSmtpConfigured(true);
          this.toastrService.success(this.translationService.getValue('EMAIL_SMTP_SETTING_UPDATED_SUCCESSFULLY'));
          this.router.navigate(['/email-smtp']);
        });
      } else {
        this.sub$.sink = this.emailSmtpSettingService.addEmailSMTPSetting(emailSMTPSetting).subscribe(() => {
          this.commonService.setIsSmtpConfigured(true);
          this.toastrService.success(this.translationService.getValue('EMAIL_SMTP_SETTING_CREATED_SUCCESSFULLY'));
          this.router.navigate(['/email-smtp']);
        });
      }
    } else {
      this.smtpSettingForm.markAllAsTouched();
    }
  }
}
