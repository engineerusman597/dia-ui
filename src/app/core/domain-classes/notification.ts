
export class UserNotification {
  id?: string;
  userId?: string;
  message: string;
  createdDate: Date;
  isRead: boolean;
  url?: string;
  name?:string;
  notificationsType?: NotificationType;
}

export enum NotificationType {
  REMINDER = 0,
  SHARE_USER = 1
}
