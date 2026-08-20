import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { User } from '@core/domain-classes/user';
import { SecurityService } from '@core/security/security.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { UserService } from '../user.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent extends BaseComponent implements OnInit {
  userForm!: UntypedFormGroup;
  user!: User;
  fileSelected!: File;
  imgURL: any;
  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private securityService: SecurityService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createUserForm();
    this.sub$.sink = this.userService.getUserProfile().subscribe((user) => {
      this.user = user as User;
      if (this.user) {
        if (this.user.profilePhoto) {
          this.imgURL = environment.apiUrl + this.user.profilePhoto;
        }
        this.userForm.patchValue(this.user);
      }
    });
  }


  fileEvent($event: any) {
    this.fileSelected = $event.target.files[0];
    if (!this.fileSelected) {
      return;
    }
    const mimeType = this.fileSelected.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.fileSelected);
    // tslint:disable-next-line: variable-name
    reader.onload = (_event) => {
      const formData = new FormData();
      formData.append(this.fileSelected.name, this.fileSelected);
      this.userService.updateProfilePhoto(formData).subscribe((user) => {
        this.toastrService.success(this.translationService.getValue('PROFILE_PHOTO_UPDATED_SUCCESSFULLY'));
        this.imgURL = reader.result;
        this.securityService.updateUserProfile(user as User);
        $event.target.value = '';
      });
    }
  }

  removeImage() {
    const formData = new FormData();
    this.userService.updateProfilePhoto(formData).subscribe((user) => {
      this.toastrService.success(this.translationService.getValue('PROFILE_PHOTO_REMOVED_SUCCESSFULLY'));
      this.imgURL = "";
      this.securityService.updateUserProfile(user as User);
    });
  }

  createUserForm() {
    this.userForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true },'',[Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      address: ['']
    });
  }

  updateProfile() {
    if (this.userForm.valid) {
      const user = this.createBuildObject();
      this.sub$.sink = this.userService.updateUserProfile(user)
        .subscribe((user) => {
          this.toastrService.success(this.translationService.getValue('PROFILE_UPDATED_SUCCESSFULLY'));
          this.securityService.updateUserProfile(user as User);
          this.router.navigate(['/dashboard']);
        });
    } else {
      this.toastrService.error(
        this.translationService.getValue('PLEASE_ENTER_PROPER_DATA')
      );
    }
  }

  createBuildObject(): User {
    const user: User = {
      id: this.userForm.get('id')?.value,
      firstName: this.userForm.get('firstName')?.value,
      lastName: this.userForm.get('lastName')?.value,
      email: this.userForm.get('email')?.value,
      phoneNumber: this.userForm.get('phoneNumber')?.value,
      userName: this.userForm.get('email')?.value,
      address: this.userForm.get('address')?.value
    };
    return user;
  }

  changePassword(): void {
    this.dialog.open(ChangePasswordComponent, {
      width: '350px',
      data: Object.assign({}, this.user),
    });
  }
}
