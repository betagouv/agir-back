import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Contact } from 'src/domain/contact/contact';
import Brevo from '@getbrevo/brevo';

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

  // add createContact
  public async createContact(contact: Contact): Promise<boolean> {
    return await this.apiInstance.createContact(contact).then(
      function (data) {
        console.log(
          'API called successfully. Returned data: ' + JSON.stringify(data),
        );
        return true;
      },
      function (error) {
        console.error(error);
        return false;
      },
    );
  }

  // add deleteContact
  public async deleteContact(email: string): Promise<boolean> {
    const identifier = email; // can be email or id

    return await this.apiInstance.deleteContact(identifier).then(
      function () {
        return true;
      },
      function (error) {
        console.error(error);
        return false;
      },
    );
  }
  // todo : add updateContact
}
