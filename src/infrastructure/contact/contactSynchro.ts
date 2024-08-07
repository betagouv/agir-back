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
  private apiKey = App.getBrevoApiToken();

  constructor() {
    this.client = Brevo.ApiClient.instance;
    const apiKey = this.client.authentications['api-key'];
    apiKey.apiKey = App.getBrevoApiToken();
    this.apiInstance = new Brevo.ContactsApi();
  }

  public async BatchUpdateContacts(utilisateurs: Utilisateur[]) {
    if (this.is_synchro_disabled()) return;

    const contacts = utilisateurs.map((utilisateur) =>
      Contact.newContactFromUser(utilisateur),
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
      console.warn(JSON.stringify(error));
    }
  }
  /*
  public async updateContacts(utilisateur: Utilisateur) {
    if (this.is_synchro_disabled()) return;

    const contact = new Contact(utilisateur);

    try {
      await this.apiInstance.updateContact(utilisateur.email, updateContact);
      console.log(
        `BREVO contact ${utilisateur.email} created and added to list ${contact.listIds}`,
      );
      return true;
    } catch (error) {
      console.warn(error.response.text);
      return false;
    }
  }
  */

  public async createContact(utilisateur: Utilisateur): Promise<boolean> {
    if (this.is_synchro_disabled()) return true;

    const contact = Contact.newContactFromUser(utilisateur);

    contact.listIds = [App.getWelcomeListId()];
    try {
      await this.apiInstance.createContact(contact);
      console.log(
        `BREVO contact ${utilisateur.email} created and added to list ${contact.listIds}`,
      );
      return true;
    } catch (error) {
      console.warn(error.response.text);
      return false;
    }
  }
  public async createContactFromContact(contact: Contact): Promise<boolean> {
    contact.listIds = [App.getWelcomeListId()];
    try {
      await this.apiInstance.createContact(contact);
      console.log(
        `BREVO contact ${contact.email} created and added to list ${contact.listIds}`,
      );
      return true;
    } catch (error) {
      console.warn(error.response.text);
      return false;
    }
  }

  public async addContactsToList(emails: string[], listId: number) {
    if (this.is_synchro_disabled()) return true;
    try {
      await this.apiInstance.addContactToList(listId, emails);
      console.log(`BREVO contacts added to list ${listId} : ${emails}`);
      return true;
    } catch (error) {
      console.warn(error.response.text);
      return false;
    }
  }

  public async deleteContact(email: string): Promise<boolean> {
    if (this.is_synchro_disabled()) return true;
    try {
      await this.apiInstance.deleteContact(email);
      console.log(`BREVO contact deleted : ${email}`);
      return true;
    } catch (error) {
      console.warn(error.response.text);
      return false;
    }
  }

  private is_synchro_disabled(): boolean {
    return !App.isMailEnabled();
  }
}
