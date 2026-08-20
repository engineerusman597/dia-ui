import { Component, OnInit, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BaseComponent } from '../base.component';
import { Router } from '@angular/router';
import { SecurityService } from '@core/security/security.service';
import { ToastrService } from 'ngx-toastr';
import { CommonError } from '@core/error-handler/common-error';
import { TranslationService } from '@core/services/translation.service';;
import { UserType } from '@core/domain-classes/user-type';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent implements OnInit {
  logoUrl?: string;
  loginFormGroup!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private securityService: SecurityService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private translationService: TranslationService,
     private idleService: IdleService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.getCompanyProfile();
    this.idleService.stop();
  }

  onLoginSubmit() {
    if (this.loginFormGroup.valid) {
      this.isLoading = true;
      const userObject = {
        ...this.loginFormGroup.value,
        userType: UserType.SuperAdmin, // Assuming userType is SuperAdmin for login. Adjust as necessary.
      };
      this.sub$.sink = this.securityService.login(userObject).subscribe({
        next: () => {
          this.isLoading = false;
           this.idleService.reset();
          this.toastr.success(
            this.translationService.getValue('USER_LOGIN_SUCCESSFULLY')
          );

          const userType = this.securityService.loginHasClaim('UserType')
            ? this.securityService.Claims['UserType']
            : null;

          if (userType === 'SuperAdmin'.toString()) {
            this.router.navigate(['/dashboard']);
          } else if (userType === 'Client'.toString()) {
            const targetId = this.securityService.Claims['ClientId'];
            if (targetId) {
              this.router.navigate([`/upload-documents/${targetId}`]);
            } else {
              this.toastr.error('Client account does not have a target client.');
              this.securityService.logout();
            }
          } else if (userType === 'SupportTeam'.toString()) {
            const targetId = this.securityService.Claims['sub'];
            if (targetId) {
              this.router.navigate([`/support/upload-document/${targetId}`]);
            } else {
              this.toastr.error('Support team account does not have a target client.');
              this.securityService.logout();
            }
          }
        },
        error: (err: CommonError) => {
          this.isLoading = false;
          if (err.messages) {
            err.messages.forEach((msg) => {
              this.toastr.error(msg);
            });
          } else if (err.error) {
            this.toastr.error(err.error as string);
          }
        },
      });
    }
  }

  createFormGroup(): void {
    this.loginFormGroup = this.fb.group({
      userName: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onRegistrationClick(): void {
    this.router.navigate(['/registration']);
  }

  setBackgroundImage(url: string): void {
    const authBg = document.querySelector('.auth-bg');
    if (authBg) {
      this.renderer.setStyle(authBg, 'background-image', `url(${url})`);
    }
  }

  getCompanyProfile(): void {
    this.securityService.companyProfile.subscribe((c) => {
      if (c) {
        this.logoUrl = c.logoUrl;
        if (c.bannerUrl) {
          this.setBackgroundImage(c.bannerUrl);
        }
      }
    });
  }
}
