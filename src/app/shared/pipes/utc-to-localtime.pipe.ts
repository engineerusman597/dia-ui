import { Pipe, PipeTransform } from '@angular/core';
enum UTCToLocalTimeFormat {
  FULL = 'full',
  SHORT = 'short',
  SHORT_DATE = "shortDate",
  SHORT_TIME = "shortTime"
}

/**
 * The business runs on UK time, so timestamps are shown in Europe/London rather
 * than the viewer's own timezone. Europe/London tracks GMT and BST on its own,
 * so this stays correct across the daylight-saving change.
 */
const DISPLAY_TIME_ZONE = 'Europe/London';

@Pipe({
  name: 'utcToLocalTime'
})

export class UTCToLocalTime implements PipeTransform {

  private formatDate(date: Date): string {
    // en-GB in the fixed zone gives day/month/year; strip the padding zeros to
    // keep the existing d/m/yyyy look.
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: DISPLAY_TIME_ZONE,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: DISPLAY_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  }

  /**
   * The API sends UTC timestamps without an offset, which browsers would otherwise
   * read as the viewer's local time. Append Z so they are parsed as UTC; values
   * that already carry an offset or Z are left alone.
   */
  private toDate(value: Date | string): Date {
    if (typeof value !== 'string') {
      return new Date(value);
    }

    const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
    const isBareDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);

    return new Date(!hasZone && isBareDateTime ? `${value}Z` : value);
  }

  transform(utcDate: Date, format: UTCToLocalTimeFormat | string): any {
    if (!utcDate) return '';

    const dateObj = this.toDate(utcDate);
    if (isNaN(dateObj.getTime())) return '';

    if (format === UTCToLocalTimeFormat.SHORT) {
      return `${this.formatDate(dateObj)} ${this.formatTime(dateObj)}`;
    }
    else if (format === UTCToLocalTimeFormat.SHORT_DATE) {
      return this.formatDate(dateObj);
    }
    else if (format === UTCToLocalTimeFormat.SHORT_TIME) {
      return this.formatTime(dateObj);
    }
    else {
      return `${this.formatDate(dateObj)} ${this.formatTime(dateObj)}`;
    }

  }
}
