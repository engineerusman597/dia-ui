import { EntityMetadataMap } from '@ngrx/data';
import { Action } from 'rxjs/internal/scheduler/Action';

const entityMetadata: EntityMetadataMap = {
  Page: {
  },
  Action: {
  },
  PageAction: {
    entityDispatcherOptions: {
      optimisticDelete: true
    }
  }
};

const pluralNames={ Category: 'Categories' };

export const entityConfig = {
  entityMetadata,
  pluralNames
};
