import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactSynchro } from '../../src/infrastructure/contact/contactSynchro';
import { Contact } from '../../src/domain/contact/contact';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';

@Injectable()
export class ContactUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public contactSynchro: ContactSynchro,
  ) {}

  async updateUtilisateursContacts() {
    const nombreTotalUtilisateurs = await this.utilisateurRepository.count();
    for (let index = 0; index < nombreTotalUtilisateurs; index += 100) {
      const utilisateurs =
        await this.utilisateurRepository.findUtilisateursForBatch(100, index);
      const contacts = utilisateurs.map((utilisateur) => {
        return new Contact(utilisateur);
      });
      this.contactSynchro.BatchUpdateContacts(contacts);
    }
  }

  async createUtilisateurContact(utilisateur: Utilisateur): Promise<boolean> {
    const contact = new Contact(utilisateur);
    return await this.contactSynchro.createContact(contact);
  }
}
