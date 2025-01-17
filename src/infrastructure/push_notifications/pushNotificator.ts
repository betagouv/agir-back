import { Injectable } from '@nestjs/common';

@Injectable()
export class PushNotificator {
  private admin_firebase;
  private messaging_service;

  constructor() {
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

  public async pushMessage(
    titre: string,
    body: string,
    image_url: string,
    data: object,
    user_token: string,
  ) {
    const message = {
      notification: {
        title: titre,
        body: body,
        image: image_url,
      },
      data: data,
      token: user_token,
    };

    try {
      const response = await this.messaging_service.send(message);
      console.log(response);
    } catch (error) {
      console.log(
        `Error sending push notification to token : ${user_token}`,
        error,
      );
    }
  }
}
