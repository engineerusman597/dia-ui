import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { EmailTemplateService } from '../email-template.service';
import { EmailTemplate } from '@core/domain-classes/email-template';
import { Editor } from 'ngx-editor';
import { editorConfig } from '@shared/editor.config';
import { MatDialog } from '@angular/material/dialog';
import { InsertHtmlButtonComponent } from '../insert-html-button/insert-html-button.component';

@Component({
  selector: 'app-email-template-manage',
  templateUrl: './email-template-manage.component.html',
  styleUrls: ['./email-template-manage.component.scss'],
})
export class EmailTemplateManageComponent
  extends BaseComponent
  implements OnInit {
  emailTemplateForm: UntypedFormGroup;
  emailTemplate: EmailTemplate;
  editor = new Editor();
  toolbar = editorConfig;

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private emailTemplateService: EmailTemplateService,
    private router: Router,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createEmailTemplateForm();
    this.getEmailResolverData();
  }

  getEmailResolverData() {
    this.sub$.sink = this.route.data.subscribe(
      (data: { emailTemplate: EmailTemplate }) => {
        if (data.emailTemplate) {
          this.emailTemplate = data.emailTemplate;
          this.patchEmailTemplateData();
        }
      }
    );
  }
  openHtmlDialog() {
    //Open a dialog to insert HTML content into the editor InsertHtmlButtonComponent
    const dialogRef = this.dialog.open(InsertHtmlButtonComponent, {
      width: '500px',
      data: { editor: this.editor }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const sanitizedResult = this.editor.schema.text(result);
        this.emailTemplateForm.patchValue({
          body: sanitizedResult.text
        });
      }
    });
  }

  addUpdateEmailTemplate() {
    if (this.emailTemplateForm.valid) {
      if (this.emailTemplate) {
        this.sub$.sink = this.emailTemplateService
          .updateEmailTemplate(this.createBuildObject())
          .subscribe((c) => {
            this.toastrService.success(
              this.translationService.getValue(
                'EMAIL_TEMPLATE_UPDATED_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/email-template']);
          });
      } else {
        this.sub$.sink = this.emailTemplateService
          .addEmailTemplate(this.createBuildObject())
          .subscribe((c) => {
            this.toastrService.success(
              this.translationService.getValue(
                'EMAIL_TEMPLATE_SAVE_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/email-template']);
          });
      }
    } else {
      for (let inner in this.emailTemplateForm.controls) {
        this.emailTemplateForm.get(inner).markAsDirty();
        this.emailTemplateForm.get(inner).updateValueAndValidity();
      }
    }
  }

  createBuildObject(): EmailTemplate {
    const emailTemplate: EmailTemplate = {
      id: this.emailTemplate ? this.emailTemplate.id : null,
      name: this.emailTemplateForm.get('name').value,
      subject: this.emailTemplateForm.get('subject').value,
      body: this.emailTemplateForm.get('body').value,
    };
    return emailTemplate;
  }

  createEmailTemplateForm() {
    this.emailTemplateForm = this.fb.group({
      name: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      body: ['', [Validators.required]],
    });
  }

  patchEmailTemplateData() {
    this.emailTemplateForm.patchValue({
      name: this.emailTemplate.name,
      subject: this.emailTemplate.subject,
      body: this.emailTemplate.body,
    });
    this.emailTemplateForm.get('name').disable();
  }
}
