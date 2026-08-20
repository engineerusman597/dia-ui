import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EmailSendComponent } from './email-send.component';

const routes: Routes = [
  {
    path: '',
    component: EmailSendComponent,
    data: { claimType: 'send_email_list' }
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class EmailSendRoutingModule { }
