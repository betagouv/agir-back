import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BrevoRepository } from '../infrastructure/contact/brevoRepository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';

const H24 = 24 * 60 * 60 * 1000;

@Injectable()
export class ContactUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public brevoRepository: BrevoRepository,
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
      this.brevoRepository.BatchUpdateContacts(utilisateurs);
      result = result.concat(utilisateurs.map((u) => u.id));
    }
    return result;
  }

  async delete(email: string): Promise<boolean> {
    return await this.brevoRepository.deleteContact(email);
  }

  async createMissingContacts(): Promise<string[]> {
    const result = [];

    const list_missing_contacts =
      await this.utilisateurRepository.listUtilisateurIdsToCreateInBrevo(100);

    for (const user_id of list_missing_contacts) {
      const utilisateur = await this.utilisateurRepository.getById(user_id, []);
      const exists = await this.brevoRepository.doesContactExists(
        utilisateur.email,
      );
      if (!exists) {
        const created_ok = await this.brevoRepository.createContact(
          utilisateur,
        );
        if (created_ok) {
          result.push(`[${utilisateur.email}] CREATE OK`);
          utilisateur.brevo_created_at = new Date();
          await this.utilisateurRepository.updateUtilisateur(utilisateur);
        } else {
          result.push(`[${utilisateur.email}] CREATE ECHEC`);
        }
      } else {
        if (!utilisateur.brevo_created_at) {
          result.push(`[${utilisateur.email}] ALREADY THERE`);
          utilisateur.brevo_created_at = new Date();
          await this.utilisateurRepository.updateUtilisateur(utilisateur);
        }
      }
    }
    return result;
  }
}
