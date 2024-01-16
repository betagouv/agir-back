import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactSynchro } from 'src/infrastructure/contact/contactSynchro';

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
      this.contactSynchro.BatchUpdateContacts(utilisateurs);
    }
  }
}
