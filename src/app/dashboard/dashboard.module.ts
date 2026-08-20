import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../shared/shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxEchartsModule } from 'ngx-echarts';
import { DashboardComponent } from './dashboard.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as echarts from 'echarts';
import { ClientsPendingApprovalComponent } from './clients-pending-approval/clients-pending-approval.component';
import { MatIconModule } from '@angular/material/icon';
import { ClientsRejectDocumentComponent } from './clients-reject-document/clients-reject-document.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    DashboardComponent,
    ClientsPendingApprovalComponent,
    ClientsRejectDocumentComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatSortModule,
    MatPaginatorModule,
    MatTableModule,
    MatCardModule,
    SharedModule,
    FullCalendarModule,
    MatTooltipModule,
    MatIconModule,
    NgxEchartsModule.forRoot({ echarts }),
    PipesModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ]
})
export class DashboardModule { }
