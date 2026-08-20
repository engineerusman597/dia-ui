import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UserNotification } from '@core/domain-classes/notification';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { fromEvent, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';
import { NotificationDataSource } from '../notification-datassource';
import { NotificationService } from '../notification.service';
import { ResponseHeader } from '@core/domain-classes/response-header';
import { NotificationSource } from '@core/domain-classes/resource-parameter';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
})
export class NotificationListComponent
  extends BaseComponent
  implements OnInit, AfterViewInit {
  dataSource: NotificationDataSource;
  notifications: UserNotification[] = [];
  displayedColumns: string[] = ['createdDate', 'message'];
  isLoadingResults = true;
  notificationResource: NotificationSource;
  loading$: Observable<boolean>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;
  footerToDisplayed = ['footer'];

  constructor(
    private notificationService: NotificationService,
    public overlay: OverlayPanel
  ) {
    super();
    this.notificationResource = new NotificationSource();
    this.notificationResource.pageSize = 10;
    this.notificationResource.orderBy = 'createdDate desc';
  }

  ngOnInit(): void {
    this.dataSource = new NotificationDataSource(this.notificationService);
    this.dataSource.loadNotifications(this.notificationResource);
    this.getResourceParameter();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.notificationResource.skip = this.paginator.pageIndex * this.paginator.pageSize;
          this.notificationResource.pageSize = this.paginator.pageSize;
          this.notificationResource.orderBy =
            this.sort.active + ' ' + this.sort.direction;
          this.dataSource.loadNotifications(this.notificationResource);
        })
      )
      .subscribe();

    this.sub$.sink = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.notificationResource.skip = 0;
          this.notificationResource.name = this.input.nativeElement.value;
          this.dataSource.loadNotifications(this.notificationResource);
        })
      )
      .subscribe();
  }
  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.notificationResource.pageSize = c.pageSize;
          this.notificationResource.skip = c.skip;
          this.notificationResource.totalCount = c.totalCount;
        }
      }
    );
  }
}
