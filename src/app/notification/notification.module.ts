import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationRoutingModule } from './notification-routing.module';
import {  MatTableModule } from '@angular/material/table';
import {  MatSelectModule } from '@angular/material/select';
import {  MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import {  MatPaginatorModule } from '@angular/material/paginator';
import {  MatInputModule } from '@angular/material/input';
import { SharedModule } from '@shared/shared.module';
import { P } from '@angular/cdk/keycodes';
import { PipesModule } from '@shared/pipes/pipes.module';
import { FeatherModule } from 'angular-feather';



@NgModule({
  declarations: [NotificationListComponent],
  imports: [
    CommonModule,
    SharedModule,
    NotificationRoutingModule,
    MatTableModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    FeatherModule,
    PipesModule
  ]
})
export class NotificationModule { }
