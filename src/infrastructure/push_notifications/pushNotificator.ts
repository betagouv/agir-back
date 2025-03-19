import { Injectable } from '@nestjs/common';
import { PushNotificationMessage } from '../../domain/notification/pushNotificationMessage';

export class MessageAPI {
  notification: {
    title: string;
    body: string;
    image: string;
  };
  data: object;
  token?: string;

  public static buildMessage(message: PushNotificationMessage): MessageAPI {
    const res: MessageAPI = {
      notification: {
        title: message.title,
        body: message.body,
        image: message.image_url,
      },
      data: message.data,
    };
    if (message.token) {
      res.token = message.token;
    }
    return res;
  }
}

@Injectable()
export class PushNotificator {
  private admin_firebase;
  private messaging_service;

  constructor() {
    if (!process.env.FIREBASE_PRIVATE_KEY_ID) {
      return;
    }

    this.admin_firebase = require('firebase-admin');

    const serviceAccount = {
      type: 'service_account',
      project_id: 'fnv-agir',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: Buffer.from(
        process.env.FIREBASE_PRIVATE_KEY,
        'base64',
      ).toString('ascii'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-la8np%40fnv-agir.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com',
    };

    this.admin_firebase.initializeApp({
      credential: this.admin_firebase.credential.cert(serviceAccount),
    });

    this.messaging_service = this.admin_firebase.messaging();
  }

  public async pushMessage(message: PushNotificationMessage): Promise<boolean> {
    if (!this.messaging_service) {
      console.error(
        'Service de push notification non initialisé correctement !',
      );
      return false;
    }

    const payload = MessageAPI.buildMessage(message);

    try {
      const response = await this.messaging_service.send(payload);
      console.log(response);
      return true;
    } catch (error) {
      console.log(
        `Error sending push notification to token : ${message.token}`,
        error,
      );
      return false;
    }
  }
}
