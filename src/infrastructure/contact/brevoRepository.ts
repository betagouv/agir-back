import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Contact } from './contact';
import Brevo from '@getbrevo/brevo';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { App } from '../../domain/app';
import { isDate } from 'util/types';

@Injectable()
export class BrevoRepository {
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
      Contact.buildContactFromUtilisateur(utilisateur),
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

  public async createContact(
    email: string,
    utilisateurId: string,
  ): Promise<boolean> {
    if (this.is_synchro_disabled()) {
      console.log(
        `BREVO creation would have been done for contact ${email} - disable on that environment `,
      );
      return true;
    }

    const contact = Contact.newContactFromEmail(email, utilisateurId);

    contact.listIds = [App.getWelcomeListId()];
    try {
      await this.apiInstance.createContact(contact);
      console.log(
        `BREVO contact ${email} created and added to list ${contact.listIds}`,
      );
      return true;
    } catch (error) {
      console.warn(error.response.text);
      console.log(`BREVO ERROR creating contact ${email}`);
      return false;
    }
  }
  public async getContactCreationDate(email: string): Promise<Date | null> {
    try {
      const brevo_contact = await this.apiInstance.getContactInfo(email);
      if (!brevo_contact) {
        return null;
      }

      const date_creation = new Date(brevo_contact.createdAt);

      if (isNaN(date_creation.getTime())) {
        console.log(
          `BAD date retrieved from BREVO : [${brevo_contact.createdAt}] => setting to now() as default`,
        );
        return new Date();
      } else {
        return date_creation;
      }
    } catch (error) {
      // Contact existant
      return null;
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
