import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import {
  LogementAPI,
  TransportAPI,
  UtilisateurProfileAPI,
  UtilisateurUpdateProfileAPI,
} from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { Injectable } from '@nestjs/common';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { ServiceRepository } from '../infrastructure/repository/service.repository';
import { GroupeRepository } from '../infrastructure/repository/groupe.repository';
import { ContactUsecase } from './contact.usecase';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { KYCID } from '../domain/kyc/KYCID';
import { Retryable } from 'typescript-retry-decorator';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import validator from 'validator';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class ProfileUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private groupeRepository: GroupeRepository,
    private serviceRepository: ServiceRepository,
    private suiviRepository: SuiviRepository,
    private bilanRepository: BilanRepository,
    private oIDCStateRepository: OIDCStateRepository,
    private contactUsecase: ContactUsecase,
    private kycRepository: KycRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
  ) {}

  @Retryable({
    maxAttempts: 1,
    doRetry: (e: any) => {
      return e.code === '050';
    },
  })
  async updateUtilisateurProfile(
    utilisateurId: string,
    profile: UtilisateurUpdateProfileAPI,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    if (profile.mot_de_passe) {
      PasswordManager.checkPasswordFormat(profile.mot_de_passe);
      PasswordManager.setUserPassword(utilisateur, profile.mot_de_passe);
    }

    const char_regexp = new RegExp('^[a-zA-Z ]*$');
    if (profile.nom) {
      if (!char_regexp.test(profile.nom)) {
        ApplicationError.throwNotAlhpaNom();
      }
    }
    if (profile.prenom) {
      if (!char_regexp.test(profile.prenom)) {
        ApplicationError.throwNotAlhpaPrenom();
      }
    }

    utilisateur.revenu_fiscal = profile.revenu_fiscal;
    utilisateur.parts = profile.nombre_de_parts_fiscales;
    utilisateur.abonnement_ter_loire = profile.abonnement_ter_loire;
    utilisateur.nom = profile.nom;
    utilisateur.prenom = profile.prenom;
    utilisateur.annee_naissance = profile.annee_naissance;

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  @Retryable({
    maxAttempts: 1,
    doRetry: (e: any) => {
      return e.code === '050';
    },
  })
  async updateUtilisateurTransport(utilisateurId: string, input: TransportAPI) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    utilisateur.transport.patch(input);

    utilisateur.recomputeRecoTags();

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  @Retryable({
    maxAttempts: 1,
    doRetry: (e: any) => {
      return e.code === '050';
    },
  })
  async updateUtilisateurLogement(utilisateurId: string, input: LogementAPI) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    utilisateur.logement.patch(input, utilisateur);

    try {
      utilisateur.kyc_history.patchLogement(input);
    } catch (error) {
      console.error(`Fail synchro KYCs logement : ${error.message}`);
    }

    utilisateur.recomputeRecoTags();

    const couverture_code_postal =
      await this.aideRepository.isCodePostalCouvert(
        utilisateur.logement.code_postal,
      );
    utilisateur.couverture_aides_ok = couverture_code_postal;

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    const utilisateur = await this.utilisateurRepository.getById(id);
    if (utilisateur) {
      utilisateur.checkState();
    } else {
      return null;
    }
    utilisateur.logement.commune_label = this.communeRepository.formatCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );
    return utilisateur;
  }

  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisateurRepository.findByEmail(email);
  }

  async computeAllUsersRecoTags() {
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];
      const utilisateur = await this.utilisateurRepository.getById(user_id);

      const catalogue = await this.kycRepository.getAllDefs();
      utilisateur.kyc_history.setCatalogue(catalogue);

      utilisateur.recomputeRecoTags();
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
  }

  async reset(confirmation: string, utilisateurId: string) {
    if (confirmation !== 'CONFIRMATION RESET') {
      ApplicationError.throwMissingResetConfirmation();
    }
    await this.resetUser(utilisateurId);
  }

  async resetAllUsers(confirmation: string) {
    if (confirmation !== 'CONFIRMATION RESET') {
      ApplicationError.throwMissingResetConfirmation();
    }
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];

      await this.resetUser(user_id);
    }
  }

  async updateAllUserCouvertureAides(): Promise<{
    couvert: number;
    pas_couvert: number;
  }> {
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    let couvert = 0;
    let pas_couvert = 0;
    for (const id of userIdList) {
      const utilisateur = await this.utilisateurRepository.getById(id);
      utilisateur.couverture_aides_ok =
        await this.aideRepository.isCodePostalCouvert(
          utilisateur.logement.code_postal,
        );
      couvert += utilisateur.couverture_aides_ok ? 1 : 0;
      pas_couvert += !utilisateur.couverture_aides_ok ? 1 : 0;
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
    return { couvert, pas_couvert };
  }
  async deleteUtilisateur(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    await this.suiviRepository.delete(utilisateurId);
    await this.bilanRepository.delete(utilisateurId);
    await this.oIDCStateRepository.delete(utilisateurId);
    await this.serviceRepository.deleteAllUserServices(utilisateurId);
    await this.groupeRepository.delete(utilisateurId);
    await this.utilisateurRepository.delete(utilisateurId);

    await this.contactUsecase.delete(utilisateur.email);
  }

  private async resetUser(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    utilisateur.resetAllHistory();

    await this.serviceRepository.deleteAllUserServices(utilisateurId);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private AorB?<T>(a: T, b: T): T {
    if (a === undefined) return b;
    return a;
  }
}
