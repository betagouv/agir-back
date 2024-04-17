import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactSynchro } from '../infrastructure/contact/contactSynchro';
import { Contact } from '../domain/contact/contact';
import { Utilisateur } from '../domain/utilisateur/utilisateur';

@Injectable()
export class ContactUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public contactSynchro: ContactSynchro,
  ) {}

  async batchUpdate() {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const nombreTotalUtilisateurs =
      await this.utilisateurRepository.countActiveUsersWithRecentActivity(date);
    for (let index = 0; index < nombreTotalUtilisateurs; index += 100) {
      const utilisateurs =
        await this.utilisateurRepository.findLastActiveUtilisateurs(
          100,
          index,
          date,
        );
      const contacts = utilisateurs.map(
        (utilisateur) => new Contact(utilisateur),
      );
      this.contactSynchro.BatchUpdateContacts(contacts);
    }
  }

  async delete(utilisateurId: string): Promise<boolean> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    if (!utilisateur || !utilisateur.email) return false;
    return await this.contactSynchro.deleteContact(utilisateur.email);
  }

  async create(utilisateur: Utilisateur): Promise<boolean> {
    const contact = new Contact(utilisateur);
    // on ajoute l'utilisateur dans la liste "bienvenue"
    contact.listIds = [parseInt(process.env.BREVO_BREVO_WELCOME_LIST_ID)];
    return await this.contactSynchro.createContact(contact);
  }

  // TODO : pas utilisé ?
  async addContactsToList(utilisateurs: Utilisateur[], listId: number) {
    const emails = utilisateurs.map((utilisateur) => utilisateur.email);
    return await this.contactSynchro.addContactsToList(emails, listId);
  }
}
