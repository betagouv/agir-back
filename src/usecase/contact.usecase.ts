import { Injectable } from '@nestjs/common';
import { Scope } from '../domain/utilisateur/utilisateur';
import {
  BrevoRepository,
  BrevoResponse,
} from '../infrastructure/contact/brevoRepository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class ContactUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public brevoRepository: BrevoRepository,
  ) {}

  async batchUpdate(): Promise<string[]> {
    let result = [];
    const BLOCK_SIZE = 100;
    const MAX_TOTAL_UPDATES = 500;

    let count_to_update =
      await this.utilisateurRepository.countUtilisateurToUpdateInBrevo();

    count_to_update = Math.min(count_to_update, MAX_TOTAL_UPDATES);

    for (let index = 0; index < count_to_update; index = index + BLOCK_SIZE) {
      let current_user_list =
        await this.utilisateurRepository.listUtilisateurToUpdateInBrevo(
          index,
          BLOCK_SIZE,
          [
            Scope.core,
            Scope.logement,
            Scope.gamification,
            Scope.notification_history,
          ],
        );

      for (const user of current_user_list) {
        const update_status = await this.brevoRepository.updateContact(user);
        if (update_status === BrevoResponse.ok) {
          result.push(`Updated Brevo contact [${user.email}] ok`);
          user.brevo_updated_at = new Date();
          await this.utilisateurRepository.updateUtilisateurNoConcurency(user, [
            Scope.core,
          ]);
        }
        if (update_status === BrevoResponse.error) {
          result.push(`ECHEC updating Brevo contact [${user.email}]`);
        }
        if (update_status === BrevoResponse.disabled) {
          result.push(`SKIP updating Brevo contact [${user.email}]`);
        }
        if (update_status === BrevoResponse.permanent_error) {
          result.push(`PERMANENT ERROR updating Brevo contact [${user.email}]`);
          user.brevo_update_disabled = true;
          await this.utilisateurRepository.updateUtilisateurNoConcurency(user, [
            Scope.core,
          ]);
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
