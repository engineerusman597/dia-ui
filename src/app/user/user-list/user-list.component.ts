import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { User } from '@core/domain-classes/user';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { UserService } from '../user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  Observable,
  merge,
  tap,
  fromEvent,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { UserDataSource } from './user-datasource';
import { UserResource } from '@core/domain-classes/user-resource';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { ResponseHeader } from '@core/domain-classes/response-header';
import { UserType } from '@core/domain-classes/user-type';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent extends BaseComponent implements OnInit {
  dataSource!: UserDataSource;
  displayedColumns: string[] = [
    'action',
    'email',
    'userType',
    'firstName',
    'lastName',
    'phoneNumber'
  ];
  isLoadingResults = true;
  userResource: UserResource;
  userType = UserType;
  loading$!: Observable<boolean>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;
  footerToDisplayed = ['footer'];
  isActiveSearchFilterCtl: FormControl = new UntypedFormControl(true);

  constructor(
    private userService: UserService,
    private toastrService: ToastrService,
    private commonDialogService: CommonDialogService,
    private dialog: MatDialog,
    private router: Router
  ) {
    super();
    this.userResource = new UserResource();
    this.userResource.pageSize = 20;
    this.userResource.orderBy = 'email asc';
  }

  ngOnInit(): void {
    this.dataSource = new UserDataSource(this.userService);
    this.userResource.isActive = true;
    this.dataSource.loadUsers(this.userResource);
    this.getResourceParameter();
    this.filterLogic();
  }

  filterLogic() {
    this.sub$.sink = this.isActiveSearchFilterCtl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((c) => {
        this.userResource.isActive = c;
        this.userResource.skip = 0;
        this.dataSource.loadUsers(this.userResource);
      });
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.userResource.skip =
            this.paginator.pageIndex * this.paginator.pageSize;
          this.userResource.pageSize = this.paginator.pageSize;
          this.userResource.orderBy =
            this.sort.active + ' ' + this.sort.direction;
          this.dataSource.loadUsers(this.userResource);
        })
      )
      .subscribe();

    this.sub$.sink = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.userResource.skip = 0;
          this.userResource.searchQuery = this.input.nativeElement.value;
          this.dataSource.loadUsers(this.userResource);
        })
      )
      .subscribe();

    this.sub$.sink = this.isActiveSearchFilterCtl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((c) => {
        this.userResource.isActive = c;
        this.userResource.skip = 0;
        this.dataSource.loadUsers(this.userResource);
      });
  }

  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.userResource.pageSize = c.pageSize;
          this.userResource.skip = c.skip;
          this.userResource.totalCount = c.totalCount;
        }
      }
    );
  }

  deleteUser(user: User) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        `${'Are you sure you want to delete this user'
        } : ${user.firstName + ' ' + user.lastName}`
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.userService
            .deleteUser(user.id as string)
            .subscribe(() => {
              this.toastrService.success('User deleted successfully');
              this.dataSource.loadUsers(this.userResource);
            });
        }
      });
  }

  resetPassword(user: User): void {
    this.dialog.open(ResetPasswordComponent, {
      width: '350px',
      data: Object.assign({}, user),
    });
  }

  editUser(userId: string) {
    this.router.navigate(['/users/manage', userId]);
  }

  userPermission(userId: string) {
    this.router.navigate(['/users/permission', userId]);
  }
}
