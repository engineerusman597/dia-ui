export abstract class ResourceParameter {
  fields? = '';
  orderBy = '';
  searchQuery? = '';
  pageSize = 30;
  skip = 0;
  name? = '';
  totalCount = 0;
  metaTags? = '';
  isActive?: boolean;
}

export class NotificationSource extends ResourceParameter{
  id?: string = '';
  createdBy?: string = '';
}