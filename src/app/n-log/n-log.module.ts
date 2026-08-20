import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NLogListComponent } from './n-log-list/n-log-list.component';
import { NLogRoutingModule } from './n-log-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '@shared/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { NLogDetailComponent } from './n-log-detail/n-log-detail.component';
import { LogDetailResolverService } from './log-detail-resolver';
import { FeatherModule } from 'angular-feather';
import { PipesModule } from '@shared/pipes/pipes.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [NLogListComponent, NLogDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    NLogRoutingModule,
    FeatherModule,
    PipesModule,
    MatIconModule,
    MatCardModule
  ],
  providers: [LogDetailResolverService],
})
export class NLogModule { }
