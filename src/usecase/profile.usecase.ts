import { Injectable } from '@nestjs/common';
import { Retryable } from 'typescript-retry-decorator';
import validator from 'validator';
import { App } from '../domain/app';
import { Logement } from '../domain/logement/logement';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import {
  LogementAPI,
  UtilisateurUpdateProfileAPI,
} from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { ApplicationError } from '../infrastructure/applicationError';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { ServiceRepository } from '../infrastructure/repository/service.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactUsecase } from './contact.usecase';
import { FranceConnectUsecase } from './franceConnect.usecase';

const FIELD_MAX_LENGTH = 40;

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
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private franceConnectUsecase: FranceConnectUsecase,
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
    Utilisateur.checkState(utilisateur);

    if (profile.mot_de_passe) {
      PasswordManager.checkPasswordFormat(profile.mot_de_passe);
      PasswordManager.setUserPassword(utilisateur, profile.mot_de_passe);
    }

    const char_regexp = new RegExp(
      "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$",
    );
    if (profile.nom) {
      if (!utilisateur.isNomPrenomModifiable()) {
        ApplicationError.throwMajNomImpossibleFC();
      }
      if (!char_regexp.test(profile.nom)) {
        ApplicationError.throwNotAlhpaNom();
      }
      if (profile.nom.length > FIELD_MAX_LENGTH) {
        ApplicationError.throwTooBigData('nom', profile.nom, FIELD_MAX_LENGTH);
      }
    }

    if (profile.pseudo) {
      if (!char_regexp.test(profile.pseudo)) {
        ApplicationError.throwNotAlhpaPseudo();
      }
      if (profile.pseudo.length > FIELD_MAX_LENGTH) {
        ApplicationError.throwTooBigData(
          'pseudo',
          profile.pseudo,
          FIELD_MAX_LENGTH,
        );
      }
      const pseudo_valide = await this.utilisateurRepository.isPseudoValide(
        profile.pseudo,
      );
      utilisateur.est_valide_pour_classement = pseudo_valide;
    }

    if (profile.prenom) {
      if (!utilisateur.isNomPrenomModifiable()) {
        ApplicationError.throwMajPrenomImpossibleFC();
      }
      if (!char_regexp.test(profile.prenom)) {
        ApplicationError.throwNotAlhpaPrenom();
      }
      if (profile.prenom.length > FIELD_MAX_LENGTH) {
        ApplicationError.throwTooBigData(
          'prenom',
          profile.prenom,
          FIELD_MAX_LENGTH,
        );
      }
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
    utilisateur.pseudo = profile.pseudo;
    utilisateur.annee_naissance = profile.annee_naissance;

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async listPseudosAValider(): Promise<{ id: string; pseudo: string }[]> {
    return await this.utilisateurRepository.listePseudosAValider();
  }
  async validerPseudos(input: { id: string; pseudo: string }[]) {
    for (const user of input) {
      await this.utilisateurRepository.validerPseudo(user.id, user.pseudo);
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
    Utilisateur.checkState(utilisateur);
    const update_data: Logement = { ...input };

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
      const code_commune = this.communeRepository.getCodeCommune(
        input.code_postal,
        input.commune,
      );
      if (!code_commune) {
        ApplicationError.throwBadCodePostalAndCommuneAssociation(
          input.code_postal,
          input.commune,
        );
      }
      utilisateur.code_commune = this.AorB(
        code_commune,
        utilisateur.code_commune,
      );
    }

    utilisateur.logement.patch(update_data, utilisateur);

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
    Utilisateur.checkState(utilisateur);
    utilisateur.logement.commune_label = this.communeRepository.formatCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );
    return utilisateur;
  }

  async setMobileToken(token: string, utilisateurId: string) {
    const utilisateur_existant =
      await this.utilisateurRepository.getUserByMobileToken(token, []);

    if (utilisateur_existant) {
      utilisateur_existant.mobile_token = null;
      utilisateur_existant.mobile_token_updated_at = new Date();
      await this.utilisateurRepository.updateUtilisateur(utilisateur_existant);
    }

    const target_user = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    Utilisateur.checkState(target_user);

    target_user.mobile_token = token;
    target_user.mobile_token_updated_at = new Date();
    await this.utilisateurRepository.updateUtilisateur(target_user);
  }
  async deleteMobileToken(utilisateurId: string) {
    const target_user = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );

    if (target_user) {
      target_user.mobile_token = null;
      target_user.mobile_token_updated_at = new Date();
      await this.utilisateurRepository.updateUtilisateur(target_user);
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
    const userIdList = await this.utilisateurRepository.listUtilisateurIds({});
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];

      await this.resetUser(user_id);
    }
  }

  async updateAllUserCouvertureAides(): Promise<{
    couvert: number;
    pas_couvert: number;
  }> {
    const userIdList = await this.utilisateurRepository.listUtilisateurIds({});
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
  async deleteUtilisateur(
    utilisateurId: string,
  ): Promise<{ fc_logout_url?: URL }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    const result = {
      fc_logout_url: undefined,
    };

    if (App.isProd()) {
      return {}; // PAS de FC encore en PROD
    } else {
      const logout_url =
        await this.franceConnectUsecase.external_logout_france_connect(
          utilisateurId,
        );
      result.fc_logout_url = logout_url.fc_logout_url;
    }

    await this.oIDCStateRepository.delete(utilisateurId);
    await this.serviceRepository.deleteAllUserServices(utilisateurId);
    await this.utilisateurRepository.delete(utilisateurId);

    await this.contactUsecase.delete(utilisateur.email);

    return result;
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
