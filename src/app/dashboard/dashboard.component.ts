import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base.component';
import { DashboradService } from './dashboard.service';
import { User } from '@core/domain-classes/user';
import { PendingApprovalCount } from './pending_approval_count';
import { CommonError } from '@core/error-handler/common-error';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  displayedColumns: string[] = ['userName', 'firstName', 'lastName', 'phoneNumber'];
  recentlyRegisteredUsers: User[] = [];
  totalClientCount = 0;
  totalApprovedClientCount = 0;
  totalRejectedClientCount = 0;
  totalPendingClientCount = 0;
  activeUserCount = 0;
  inactiveUserCount = 0;
  onlineUsers: User[];
  onlinerUsersCount: number = 0;
  bothDocumentApprovedClient: number = 0;

  constructor(
    private dashboardService: DashboradService) {
    super();
  }

  ngOnInit() {
    this.getClientCount();
    this.getApprovedOrPendingClientCount();
  }


  getClientCount() {
    this.sub$.sink = this.dashboardService.getTotalClientCount().subscribe((res) => {
      if (res && 'totalClientCount' in res) {
        this.totalClientCount = res.totalClientCount;
      }
    });
  }

  getApprovedOrPendingClientCount() {
    this.sub$.sink = this.dashboardService.getApprovedOrPendingClientCount()
      .subscribe((res: PendingApprovalCount | CommonError) => {
        if (res && 'totalPendingClient' in res) {
          this.totalPendingClientCount = res?.totalPendingClient;
          this.totalApprovedClientCount = res?.totalApprovedClient;
          this.totalRejectedClientCount = res?.totalRejectClient;
          this.bothDocumentApprovedClient = res?.bothDocumentApprovedClient;
        }
      });

  }
}





