export class PushNotificationMessage {
  title: string;
  body: string;
  image_url: string;
  token?: string;
  data: object;

  constructor(data: PushNotificationMessage) {
    Object.assign(this, data);
  }
}
