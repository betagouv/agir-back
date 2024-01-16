import { Injectable } from '@nestjs/common';
import axios from 'axios';
const Brevo = require('@getbrevo/brevo');

type Contact = {
  attributes: {
    POINTS: number;
    EMAIL: string;
  };
  email: string;
  ext_id?: string;
  emailBlacklisted?: boolean;
  smtpBlacklistSender?: boolean;
  smsBlacklisted?: boolean;
  listIds?: number[];
  unlinkListIds?: number[];
};

@Injectable()
export class ContactSynchro {
  private client;
  private apiInstance;
  private batchApiUrl = 'https://api.brevo.com/v3/contacts/batch';
  private apiKey = process.env.EMAIL_API_TOKEN;

  constructor() {
    this.apiKey = process.env.EMAIL_API_TOKEN;
    this.batchApiUrl = 'https://api.brevo.com/v3/contacts/batch';

    this.client = Brevo.ApiClient.instance;
    const apiKey = this.client.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_API_TOKEN;
    this.apiInstance = new Brevo.ContactsApi();
  }

  public async BatchUpdateContacts(contacts: Contact[]) {
    const data = {
      contacts,
    };

    axios
      .post(this.batchApiUrl, data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // todo : add createContact
  // todo : add deleteContact
  // todo : add updateContact
}
