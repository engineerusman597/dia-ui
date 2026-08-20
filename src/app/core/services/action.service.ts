import { Injectable } from '@angular/core';
import { Action } from '@core/domain-classes/action';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

@Injectable({providedIn: 'root'})
export class ActionService extends EntityCollectionServiceBase<Action>  {

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
      super('Action', serviceElementsFactory);
  }

}
