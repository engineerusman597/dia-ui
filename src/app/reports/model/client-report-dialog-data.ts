import { ClientReportMode } from './client-report-mode';

export interface ClientReportDialogData {
  mode: ClientReportMode;
  fromDate?: Date | null;
  toDate?: Date | null;
}
