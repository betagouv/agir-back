import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactSynchro } from '../infrastructure/contact/contactSynchro';
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
      this.contactSynchro.BatchUpdateContacts(utilisateurs);
    }
  }

  async delete(email: string): Promise<boolean> {
    return await this.contactSynchro.deleteContact(email);
  }

  async create(utilisateur: Utilisateur): Promise<boolean> {
    return await this.contactSynchro.createContact(utilisateur);
  }
}
