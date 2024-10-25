import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import {
  LogementAPI,
  UtilisateurUpdateProfileAPI,
} from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { Injectable } from '@nestjs/common';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { ServiceRepository } from '../infrastructure/repository/service.repository';
import { ContactUsecase } from './contact.usecase';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { Retryable } from 'typescript-retry-decorator';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import validator from 'validator';
import { QuestionKYCUsecase } from './questionKYC.usecase';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class ProfileUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private serviceRepository: ServiceRepository,
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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    utilisateur.checkState();

    if (profile.mot_de_passe) {
      PasswordManager.checkPasswordFormat(profile.mot_de_passe);
      PasswordManager.setUserPassword(utilisateur, profile.mot_de_passe);
    }

    const char_regexp = new RegExp(
      "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$",
    );
    if (profile.nom) {
      if (!char_regexp.test(profile.nom)) {
        ApplicationError.throwNotAlhpaNom();
      }
    }
    if (profile.prenom) {
      if (!char_regexp.test(profile.prenom)) {
        ApplicationError.throwNotAlhpaPrenom();
      }
      utilisateur.est_valide_pour_classement = false;
    }

    if (profile.revenu_fiscal) {
      if (!validator.isInt('' + profile.revenu_fiscal))
        ApplicationError.throwRFRNotNumer();
    }
    if (profile.annee_naissance) {
      if (!validator.isInt('' + profile.annee_naissance))
        ApplicationError.throwBadAnnee();
    }
    if (profile.nombre_de_parts_fiscales) {
      if (!validator.isDecimal('' + profile.nombre_de_parts_fiscales))
        ApplicationError.throwPartsFiscalesNotDecimal();
    }

    utilisateur.revenu_fiscal = profile.revenu_fiscal;
    utilisateur.parts = profile.nombre_de_parts_fiscales;
    utilisateur.abonnement_ter_loire = profile.abonnement_ter_loire;
    utilisateur.nom = profile.nom;
    utilisateur.prenom = profile.prenom;
    utilisateur.annee_naissance = profile.annee_naissance;

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async listPrenomsAValider(): Promise<{ id: string; prenom: string }[]> {
    return await this.utilisateurRepository.listePrenomsAValider();
  }
  async validerPrenoms(input: { id: string; prenom: string }[]) {
    for (const user of input) {
      await this.utilisateurRepository.validerPrenom(user.id, user.prenom);
    }
  }

  @Retryable({
    maxAttempts: 1,
    doRetry: (e: any) => {
      return e.code === '050';
    },
  })
  async updateUtilisateurLogement(utilisateurId: string, input: LogementAPI) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement, Scope.kyc],
    );
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    if (input.nombre_adultes) {
      if (!validator.isInt('' + input.nombre_adultes))
        ApplicationError.throwNbrAdultesEnfants();
    }
    if (input.nombre_enfants) {
      if (!validator.isInt('' + input.nombre_enfants))
        ApplicationError.throwNbrAdultesEnfants();
    }
    if (input.code_postal) {
      if (!validator.isInt(input.code_postal))
        ApplicationError.throwCodePostalIncorrect();
      if (input.code_postal.length !== 5)
        ApplicationError.throwCodePostalIncorrect();
    }

    if (
      (input.commune && !input.code_postal) ||
      (!input.commune && input.code_postal)
    ) {
      ApplicationError.throwCodePostalCommuneMandatory();
    }

    if (input.commune) {
      const ok = this.communeRepository.checkOKCodePostalAndCommune(
        input.code_postal,
        input.commune,
      );
      if (!ok) {
        ApplicationError.throwBadCodePostalAndCommuneAssociation(
          input.code_postal,
          input.commune,
        );
      }
    }

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
    const utilisateur = await this.utilisateurRepository.getById(id, [
      Scope.unlocked_features,
      Scope.logement,
      Scope.kyc,
    ]);
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

  async liste5questOnboarding(): Promise<string[]> {
    const result = [];
    const kyc_catalogue = await this.kycRepository.getAllDefs();
    let count_onboarding_7_done = 0;
    let count_onboarding_non_done = 0;

    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];
      const utilisateur = await this.utilisateurRepository.getById(user_id, [
        Scope.todo,
        Scope.kyc,
      ]);
      utilisateur.kyc_history.setCatalogue(kyc_catalogue);
      if (utilisateur.parcours_todo.isEndedTodo()) {
        const enchainement_mini_bilan =
          utilisateur.kyc_history.getEnchainementKYCsEligibles(
            QuestionKYCUsecase.ENCHAINEMENTS[
              'ENCHAINEMENT_KYC_mini_bilan_carbone'
            ],
          );
        if (enchainement_mini_bilan.getProgression().current === 7) {
          count_onboarding_7_done++;
        } else {
          result.push(
            `user : ${utilisateur.id}/${utilisateur.email} - bilan incomplet`,
          );
        }
      } else {
        count_onboarding_non_done++;
      }
    }
    result.push(`Onboarding_7_done : ${count_onboarding_7_done}`);
    result.push(`Onboarding_non_done : ${count_onboarding_non_done}`);
    return result;
  }

  async updateAllUserCouvertureAides(): Promise<{
    couvert: number;
    pas_couvert: number;
  }> {
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    let couvert = 0;
    let pas_couvert = 0;
    for (const id of userIdList) {
      const utilisateur = await this.utilisateurRepository.getById(id, [
        Scope.logement,
      ]);
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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );

    await this.oIDCStateRepository.delete(utilisateurId);
    await this.serviceRepository.deleteAllUserServices(utilisateurId);
    await this.utilisateurRepository.delete(utilisateurId);

    await this.contactUsecase.delete(utilisateur.email);
  }

  private async resetUser(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.ALL],
    );

    utilisateur.resetAllHistory();

    await this.serviceRepository.deleteAllUserServices(utilisateurId);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private AorB?<T>(a: T, b: T): T {
    if (a === undefined) return b;
    return a;
  }
}
