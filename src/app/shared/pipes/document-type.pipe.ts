import { Pipe, PipeTransform } from '@angular/core';
import { DocumentType } from '../../../app/client/model/document-type';

@Pipe({
  name: 'documentType'
})
export class DocumentTypePipe implements PipeTransform {
  transform(value: DocumentType | number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    const v = typeof value === 'string' ? Number(value) : (value as number);
    switch (v) {
      case DocumentType.IdentityProof:
        return 'Proof of Id';
      case DocumentType.AddressProof:
        return 'Address Proof';
      case DocumentType.AdditionalDocument:
        return 'Additional Document';
      default:
        return String(value);
    }
  }
}
