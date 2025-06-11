import { Injectable } from '@nestjs/common';
import { Retryable } from 'typescript-retry-decorator';
import validator from 'validator';
import { RechercheServiceManager } from '../domain/bibliotheque_services/recherche/rechercheServiceManager';
import { KycToTags_v2 } from '../domain/kyc/synchro/kycToTagsV2';
import { LogementToKycSync } from '../domain/kyc/synchro/logementToKycSync';
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
import { MaifRepository } from '../infrastructure/repository/services_recherche/maif/maif.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactUsecase } from './contact.usecase';
import { FranceConnectUsecase } from './franceConnect.usecase';

const FIELD_MAX_LENGTH = 40;
const NUM_RUE_MAX_LENGTH = 10;
const NOM_RUE_MAX_LENGTH = 100;

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
    private rechercheServiceManager: RechercheServiceManager,
    private maifRepository: MaifRepository,
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
    const char_regexp_plus_chiffres = new RegExp(
      "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-0123456789]+$",
    );
    if (profile.nom) {
      if (!utilisateur.isDataFranceConnectModifiable()) {
        ApplicationError.throwMajImpossibleFC();
      }
      if (!char_regexp.test(profile.nom)) {
        ApplicationError.throwNotAlhpaNom();
      }
      if (profile.nom.length > FIELD_MAX_LENGTH) {
        ApplicationError.throwTooBigData('nom', profile.nom, FIELD_MAX_LENGTH);
      }
    }

    if (profile.pseudo) {
      if (!char_regexp_plus_chiffres.test(profile.pseudo)) {
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
      if (!utilisateur.isDataFranceConnectModifiable()) {
        ApplicationError.throwMajImpossibleFC();
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
      if (!utilisateur.isDataFranceConnectModifiable()) {
        ApplicationError.throwMajImpossibleFC();
      }
      if (
        !validator.isInt('' + profile.annee_naissance) ||
        parseInt('' + profile.annee_naissance) < 1900 ||
        parseInt('' + profile.annee_naissance) > 2100
      )
        ApplicationError.throwBadAnnee(profile.annee_naissance);
    }
    if (profile.mois_naissance) {
      if (!utilisateur.isDataFranceConnectModifiable()) {
        ApplicationError.throwMajImpossibleFC();
      }
      if (
        !validator.isInt('' + profile.mois_naissance) ||
        parseInt('' + profile.mois_naissance) < 1 ||
        parseInt('' + profile.mois_naissance) > 12
      )
        ApplicationError.throwBadMonth(profile.mois_naissance);
    }
    if (profile.jour_naissance) {
      if (!utilisateur.isDataFranceConnectModifiable()) {
        ApplicationError.throwMajImpossibleFC();
      }
      if (
        !validator.isInt('' + profile.jour_naissance) ||
        parseInt('' + profile.jour_naissance) < 1 ||
        parseInt('' + profile.jour_naissance) > 31
      )
        ApplicationError.throwBadDay(profile.jour_naissance);
    }
    if (profile.nombre_de_parts_fiscales) {
      const normal_string = ('' + profile.nombre_de_parts_fiscales).replace(
        ',',
        '.',
      );
      if (
        !validator.isDecimal(normal_string, {
          decimal_digits: '0,1',
        })
      ) {
        ApplicationError.throwPartsFiscalesNotDecimal(
          '' + profile.nombre_de_parts_fiscales,
        );
      } else {
        const normal_value = parseFloat(normal_string);
        if (normal_value > 99.5 || normal_value < 0.5) {
          ApplicationError.throwPartsFiscalesNotDecimal('' + normal_value);
        }
        profile.nombre_de_parts_fiscales = normal_value;
      }
    }

    utilisateur.revenu_fiscal = profile.revenu_fiscal;
    utilisateur.parts = profile.nombre_de_parts_fiscales;
    utilisateur.abonnement_ter_loire = profile.abonnement_ter_loire;
    utilisateur.nom = profile.nom;
    utilisateur.prenom = profile.prenom;
    utilisateur.pseudo = profile.pseudo;
    utilisateur.annee_naissance = profile.annee_naissance
      ? parseInt('' + profile.annee_naissance)
      : undefined;
    utilisateur.mois_naissance = profile.mois_naissance
      ? parseInt('' + profile.mois_naissance)
      : undefined;
    utilisateur.jour_naissance = profile.jour_naissance
      ? parseInt('' + profile.jour_naissance)
      : undefined;

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
      [Scope.logement, Scope.kyc, Scope.recommandation],
    );
    Utilisateur.checkState(utilisateur);
    const data_to_update: Partial<Logement> = { ...input };

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
      (!input.commune && !input.code_commune && input.code_postal)
    ) {
      ApplicationError.throwCodePostalCommuneMandatory();
    }

    if (input.commune) {
      const code_commune = this.communeRepository.getCommuneCodeInsee(
        input.code_postal,
        input.commune,
      );
      if (!code_commune) {
        ApplicationError.throwBadCodePostalAndCommuneAssociation(
          input.code_postal,
          input.commune,
        );
      }
      data_to_update.code_commune = code_commune;
    }

    if (input.code_commune) {
      const commune = this.communeRepository.getCommuneByCodeINSEE(
        input.code_commune,
      );
      if (!commune.codesPostaux.includes(input.code_postal)) {
        ApplicationError.throwBadCodePostalAndCommuneAssociation(
          input.code_postal,
          input.code_commune,
        );
      }
      if (commune) {
        data_to_update.code_commune = commune.code;
        data_to_update.commune = commune.nom;
      } else {
        ApplicationError.throwCodeCommuneNotFound(input.code_commune);
      }
    }

    if (input.rue) {
      if (input.rue.length > NOM_RUE_MAX_LENGTH) {
        ApplicationError.throwTooBigData('rue', input.rue, NOM_RUE_MAX_LENGTH);
      }
    }
    if (input.numero_rue) {
      if (input.numero_rue.length > NUM_RUE_MAX_LENGTH) {
        ApplicationError.throwTooBigData(
          'numero_rue',
          input.numero_rue,
          NUM_RUE_MAX_LENGTH,
        );
      }
    }
    if (input.numero_rue) {
      if (input.numero_rue.length > NUM_RUE_MAX_LENGTH) {
        ApplicationError.throwTooBigData(
          'numero_rue',
          input.numero_rue,
          NUM_RUE_MAX_LENGTH,
        );
      }
    }
    if (input.longitude) {
      if (!validator.isDecimal('' + input.longitude)) {
        ApplicationError.throwNotDecimalField('longitude', input.longitude);
      }
    }
    if (input.latitude) {
      if (!validator.isDecimal('' + input.latitude)) {
        ApplicationError.throwNotDecimalField('latitude', input.latitude);
      }
    }

    utilisateur.logement.patch(data_to_update, utilisateur);

    if (data_to_update.code_commune) {
      new KycToTags_v2(
        utilisateur.kyc_history,
        utilisateur.recommandation,
        utilisateur.logement,
        this.communeRepository,
      ).refreshTagState();
    }

    try {
      LogementToKycSync.synchronize(input, utilisateur.kyc_history);
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

    if (input.longitude && input.latitude) {
      this.setRisqueFromCoordonnees(utilisateur);
    }
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    const utilisateur = await this.utilisateurRepository.getById(id, [
      Scope.logement,
      Scope.kyc,
      Scope.gamification,
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

    await this.utilisateurRepository.setMobileToken(utilisateurId, token);
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

  /*
  async updateAllCommuneRisques(block_size: number = 50): Promise<string[]> {
    const result: string[] = [];
    const total_user_count = await this.utilisateurRepository.countAll();

    const MAX_TOTAL_COMPUTE = 200;

    let total = 0;

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.logement],
          {},
        );

      for (const user of current_user_list) {
        if (total > MAX_TOTAL_COMPUTE) return result;

        if (!user.code_commune) {
          result.push(`Code commune absent pour [${user.id}]`);
        } else if (user.logement.risques.nombre_catnat_commune !== undefined) {
          result.push(`Risques commune déjà présents pour [${user.id}]`);
        } else {
          try {
            await this.setRisquesFromCodeCommune(user, false);
            result.push(`Computed risques communes OK for [${user.id}]`);
            total++;
          } catch (error) {
            result.push(
              `Error computing risques communes for [${user.id}] : ${error.message}`,
            );
          }
        }
      }
    }
    return result;
  }
    */

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
    let result = {
      fc_logout_url: undefined,
    };

    const logout_url =
      await this.franceConnectUsecase.external_logout_france_connect(
        utilisateurId,
      );
    result.fc_logout_url = logout_url.fc_logout_url;

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

  private async setRisqueFromCoordonnees(utilisateur: Utilisateur) {
    if (utilisateur.logement.longitude && utilisateur.logement.latitude) {
      const scoring = await this.maifRepository.findScoreRisque_2(
        utilisateur.logement.longitude,
        utilisateur.logement.latitude,
      );
      utilisateur.logement.score_risques_adresse = scoring;
      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.logement],
      );
    }
  }
}
