import { Component, Input } from '@angular/core';
import { ClientReportMode } from '../../model/client-report-mode';
import { ClientReportCoreComponent } from '../client-report-list.component';

@Component({
    selector: 'app-client-report-page',
    standalone: true,
    imports: [ClientReportCoreComponent],
    template: `
    <app-client-report-core
      [mode]="reportModes.Assigned"
      [assignToId]="assignToId"
      [name]="name"/>
  `
})
export class ClientReportPageComponent {
    readonly reportModes = ClientReportMode;
    @Input() assignToId: string | null = null;
    @Input() name: string | null = null;
}
