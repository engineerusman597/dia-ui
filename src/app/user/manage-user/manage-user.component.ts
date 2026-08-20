import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@core/domain-classes/user';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { UserService } from '../user.service';
import { UserType } from '@core/domain-classes/user-type';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent extends BaseComponent implements OnInit {
  user!: User;
  userForm!: FormGroup;
  isEditMode = false;
  userType = UserType;

  constructor(private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private toastrService: ToastrService,
    private translationService: TranslationService) {
    super();
  }

  ngOnInit(): void {
    this.createUserForm();
    this.sub$.sink = this.activeRoute.data.subscribe(
      (data) => {
        if (data.user) {
          this.isEditMode = true;
          this.userForm.patchValue(data.user);
          this.user = data.user;
          this.userForm.get('email')?.disable();
        } else {
          this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
          this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
          this.userForm.get('email')?.enable();
        }
      });
  }

  createUserForm() {
    this.userForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: [''],
      confirmPassword: [''],
      address: [''],
      isActive: [true],
      userType: [UserType.SuperAdmin],
    }, {
      validator: this.checkPasswords
    });
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true }
  }

  saveUser() {
    if (this.userForm.valid) {
      const user = this.createBuildObject();
      if (this.isEditMode) {
        this.sub$.sink = this.userService.updateUser(user).subscribe(() => {
          this.toastrService.success(this.translationService.getValue('USER_UPDATED_SUCCESSFULLY'));
          this.router.navigate(['/users']);
        });
      } else {
        this.sub$.sink = this.userService.addUser(user).subscribe(() => {
          this.toastrService.success(this.translationService.getValue('USER_CREATED_SUCCESSFULLY'));
          this.router.navigate(['/users']);
        });
      }
    } else {
      this.toastrService.error(this.translationService.getValue('PLEASE_ENTER_PROPER_DATA'))
    }
  }

  createBuildObject(): User {
    const user: User = {
      id: this.userForm.get('id')?.value,
      firstName: this.userForm.get('firstName')?.value,
      lastName: this.userForm.get('lastName')?.value,
      email: this.userForm.get('email')?.value,
      phoneNumber: this.userForm.get('phoneNumber')?.value,
      password: this.userForm.get('password')?.value,
      userName: this.userForm.get('email')?.value,
      isActive: this.userForm.get('isActive')?.value,
      address: this.userForm.get('address')?.value,
      userType: this.userForm.get('userType')?.value,
    }
    return user;
  }
}
