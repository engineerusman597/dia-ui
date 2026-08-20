import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RequestStatus } from 'src/app/client/model/request-status';

@Component({
  selector: 'app-document-status-alert',
  standalone: true,
  imports: [
    MatIconModule,
    NgClass
  ],
  templateUrl: './document-status-alert.component.html',
  styleUrl: './document-status-alert.component.css'
})
export class DocumentStatusAlertComponent {
  @Input() status: RequestStatus | null = null;
  @Input() description: string | null = null;
  documentStatus = RequestStatus;
}
