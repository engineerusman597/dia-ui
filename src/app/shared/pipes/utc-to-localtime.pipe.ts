import { Pipe, PipeTransform } from '@angular/core';
enum UTCToLocalTimeFormat {
  FULL = 'full',
  SHORT = 'short',
  SHORT_DATE = "shortDate",
  SHORT_TIME = "shortTime"
}

@Pipe({
  name: 'utcToLocalTime'
})

export class UTCToLocalTime implements PipeTransform {

  private formatDate(date: Date): string {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();

    return `${d}/${m}/${y}`; // 👉 15/4/2026
  }

  transform(utcDate: Date, format: UTCToLocalTimeFormat | string): any {
    if (!utcDate) return '';

    const dateObj = new Date(utcDate);

    if (format === UTCToLocalTimeFormat.SHORT) {
      const date = this.formatDate(dateObj);
      const time = dateObj.toLocaleTimeString();
      return `${date} ${time}`;
    }
    else if (format === UTCToLocalTimeFormat.SHORT_DATE) {
      return this.formatDate(dateObj); // ⭐ FIXED
    }
    else if (format === UTCToLocalTimeFormat.SHORT_TIME) {
      return dateObj.toLocaleTimeString();
    }
    else {
      const date = this.formatDate(dateObj);
      const time = dateObj.toLocaleTimeString();
      return `${date} ${time}`;
    }

  }
}
