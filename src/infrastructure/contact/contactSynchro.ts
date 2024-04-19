import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Contact } from '../../../src/infrastructure/contact/contact';
import Brevo from '@getbrevo/brevo';
import { Utilisateur } from '../../../src/domain/utilisateur/utilisateur';
import { App } from '../../../src/domain/app';

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
    if (!App.isMailEnabled()) return;

    const contacts = utilisateurs.map(
      (utilisateur) => new Contact(utilisateur),
    );

    const data = {
      contacts: contacts,
    };

    try {
      const response = await axios.post(this.batchApiUrl, data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  public async createContact(utilisateur: Utilisateur): Promise<boolean> {
    if (!App.isMailEnabled()) return true;

    const contact = new Contact(utilisateur);

    contact.listIds = [parseInt(process.env.BREVO_BREVO_WELCOME_LIST_ID)];
    try {
      await this.apiInstance.createContact(contact);
      console.log(
        `BREVO contact ${utilisateur.email} created and added to list ${contact.listIds}`,
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async addContactsToList(emails: string[], listId: number) {
    if (!App.isMailEnabled()) return true;
    try {
      await this.apiInstance.addContactToList(listId, emails);
      console.log(`BREVO contacts added to list ${listId} : ${emails}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async deleteContact(email: string): Promise<boolean> {
    if (!App.isMailEnabled()) return true;
    try {
      await this.apiInstance.deleteContact(email);
      console.log(`BREVO contact deleted : ${email}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
