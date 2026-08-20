import { Injectable } from '@angular/core';
import { PageAction } from '@core/domain-classes/page-action';

import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

@Injectable({ providedIn: 'root' })
export class PageActionService extends EntityCollectionServiceBase<PageAction>  {

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('PageAction', serviceElementsFactory);
  }

}
