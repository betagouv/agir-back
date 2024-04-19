import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactSynchro } from '../infrastructure/contact/contactSynchro';
import { Utilisateur } from '../domain/utilisateur/utilisateur';

const H24 = 24 * 60 * 60 * 1000;

@Injectable()
export class ContactUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public contactSynchro: ContactSynchro,
  ) {}

  async batchUpdate(): Promise<string[]> {
    let result = [];
    const hier = new Date(Date.now() - H24);

    const nombreTotalUtilisateurs =
      await this.utilisateurRepository.countActiveUsersWithRecentActivity(hier);

    for (let index = 0; index < nombreTotalUtilisateurs; index += 100) {
      const utilisateurs =
        await this.utilisateurRepository.findLastActiveUtilisateurs(
          100,
          index,
          hier,
        );
      this.contactSynchro.BatchUpdateContacts(utilisateurs);
      result = result.concat(utilisateurs.map((u) => u.id));
    }
    return result;
  }
  async update(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    this.contactSynchro.BatchUpdateContacts([utilisateur]);
  }

  async delete(email: string): Promise<boolean> {
    return await this.contactSynchro.deleteContact(email);
  }

  async create(utilisateur: Utilisateur): Promise<boolean> {
    return await this.contactSynchro.createContact(utilisateur);
  }
  async createById(utilisateurId: string): Promise<boolean> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    return await this.contactSynchro.createContact(utilisateur);
  }
}
