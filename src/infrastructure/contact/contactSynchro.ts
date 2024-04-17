import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Contact } from '../../../src/infrastructure/contact/contact';
import Brevo from '@getbrevo/brevo';
import { Utilisateur } from '../../../src/domain/utilisateur/utilisateur';

@Injectable()
export class ContactSynchro {
  private client;
  private apiInstance;
  private batchApiUrl = 'https://api.brevo.com/v3/contacts/batch';
  private apiKey = process.env.EMAIL_API_TOKEN;

  constructor() {
    this.client = Brevo.ApiClient.instance;
    const apiKey = this.client.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_API_TOKEN;
    this.apiInstance = new Brevo.ContactsApi();
  }

  public async BatchUpdateContacts(utilisateurs: Utilisateur[]) {
    if (process.env.EMAIL_ENABLED === 'true') {
      const contacts = utilisateurs.map(
        (utilisateur) => new Contact(utilisateur),
      );

      const data = {
        contacts: contacts,
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
  }

  public async createContact(utilisateur: Utilisateur): Promise<boolean> {
    if (process.env.EMAIL_ENABLED !== 'true') return true;

    const contact = new Contact(utilisateur);

    // on ajoute l'utilisateur dans la liste "bienvenue"
    contact.listIds = [parseInt(process.env.BREVO_BREVO_WELCOME_LIST_ID)];

    return await this.apiInstance.createContact(contact).then(
      function (data) {
        console.log(
          `BREVO contact ${utilisateur.email} created and added to list ${contact.listIds}`,
        );
        return true;
      },
      function (error) {
        console.error(error);
        return false;
      },
    );
  }

  public async addContactsToList(emails: string[], listId: number) {
    if (process.env.EMAIL_ENABLED !== 'true') return true;
    return this.apiInstance.addContactToList(listId, emails).then(
      function (data) {
        console.log(`BREVO contacts added to list ${listId} : ${emails}`);
        return true;
      },
      function (error) {
        return false;
      },
    );
  }

  public async deleteContact(email: string): Promise<boolean> {
    if (process.env.EMAIL_ENABLED !== 'true') return true;
    return await this.apiInstance.deleteContact(email).then(
      function () {
        console.log(`BREVO contact deleted : ${email}`);
        return true;
      },
      function (error) {
        console.error(error);
        return false;
      },
    );
  }
}
