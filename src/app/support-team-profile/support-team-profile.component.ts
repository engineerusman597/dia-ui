import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { User } from '@core/domain-classes/user';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordComponent } from '../user/change-password/change-password.component';
import { UserService } from '../user/user.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-support-team-profile',
  standalone: true,
  imports: [MatDialogModule, MatIconModule , RouterLink , MatCardModule],
  templateUrl: './support-team-profile.component.html',
  styleUrls: ['./support-team-profile.component.scss']
})
export class SupportTeamProfileComponent implements OnInit {
  user: User | null = null;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user as User;
      },
      error: () => {
        this.toastr.error('Unable to load profile details.');
      }
    });
  }

  changePassword(): void {
    if (!this.user) {
      this.toastr.warning('Profile details are not loaded yet.');
      return;
    }

    this.dialog.open(ChangePasswordComponent, {
      width: '350px',
      data: { ...this.user },
    });
  }

  goBack(): void {
    this.router.navigate(['/support/upload-document']);
  }
}
