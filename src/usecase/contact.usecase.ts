import { Injectable } from '@nestjs/common';
import { Scope } from '../domain/utilisateur/utilisateur';
import { BrevoRepository } from '../infrastructure/contact/brevoRepository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

const H24 = 24 * 60 * 60 * 1000;

@Injectable()
export class ContactUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public brevoRepository: BrevoRepository,
  ) {}

  async batchUpdate(): Promise<string[]> {
    let result = [];
    const block_size = 100;

    const count_to_update =
      await this.utilisateurRepository.countUtilisateurToUpdateInBrevo();

    for (let index = 0; index < count_to_update; index = index + block_size) {
      let current_user_list =
        await this.utilisateurRepository.listUtilisateurToUpdateInBrevo(
          index,
          block_size,
          [
            Scope.core,
            Scope.logement,
            Scope.gamification,
            Scope.notification_history,
          ],
        );

      current_user_list = current_user_list.filter(
        (u) => u.id === 'wojtek' || u.id === 'wojtek2',
      );
      for (const user of current_user_list) {
        const updated_OK = await this.brevoRepository.updateContact(user);
        if (updated_OK) {
          result.push(`Updated Brevo contact ${user.email} ok`);
        } else {
          result.push(`ECHEC updating Brevo contact ${user.email}`);
        }
      }
    }

    return result;
  }

  async delete(email: string): Promise<boolean> {
    return await this.brevoRepository.deleteContact(email);
  }

  async createMissingContacts(): Promise<string[]> {
    const result = [];

    const list_missing_contacts =
      await this.utilisateurRepository.listUtilisateurIdsToCreateInBrevo(200);

    for (const user_id of list_missing_contacts) {
      const utilisateur = await this.utilisateurRepository.getById(user_id, []);
      const creation_date = await this.brevoRepository.getContactCreationDate(
        utilisateur.email,
      );
      if (creation_date) {
        result.push(`[${utilisateur.email}] ALREADY THERE`);
        utilisateur.brevo_created_at = creation_date;
        await this.utilisateurRepository.updateUtilisateur(utilisateur);
      } else {
        const created_ok = await this.brevoRepository.createContact(
          utilisateur.email,
          utilisateur.id,
        );
        if (created_ok) {
          result.push(`[${utilisateur.email}] CREATE OK`);
          utilisateur.brevo_created_at = new Date();
          await this.utilisateurRepository.updateUtilisateur(utilisateur);
        } else {
          result.push(`[${utilisateur.email}] CREATE ECHEC`);
        }
      }
    }
    return result;
  }
}
