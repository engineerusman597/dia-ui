import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genderLabel'
})
export class GenderPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    switch (value) {
      case 'M':
      case 'Male':
        return 'Male';
      case 'F':
      case 'Female':
        return 'Female';
      case 'O':
      case 'Others':
        return 'Others';
      default:
        return String(value);
    }
  }
}
