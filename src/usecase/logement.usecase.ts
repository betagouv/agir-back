import { Injectable } from '@nestjs/common';
import { Retryable } from 'typescript-retry-decorator';
import validator from 'validator';
import { LogementToKycSync } from '../domain/kyc/synchro/logementToKycSync';
import { Logement } from '../domain/logement/logement';
import { KycToTags_v2 } from '../domain/scoring/system_v2/kycToTagsV2';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { LogementAPI } from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { ApplicationError } from '../infrastructure/applicationError';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { RisquesNaturelsCommunesRepository } from '../infrastructure/repository/risquesNaturelsCommunes.repository';
import { MaifRepository } from '../infrastructure/repository/services_recherche/maif/maif.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

const NUM_RUE_MAX_LENGTH = 10;
const NOM_RUE_MAX_LENGTH = 100;

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class LogementUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private maifRepository: MaifRepository,
    private risquesNaturelsCommunesRepository: RisquesNaturelsCommunesRepository,
  ) {}

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

    if (
      (input.numero_rue ||
        input.rue ||
        input.code_commune ||
        input.code_postal) &&
      utilisateur.logement.prm &&
      utilisateur.logement.est_prm_par_adresse
    ) {
      utilisateur.logement.est_prm_obsolete = true;
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

    if (input.longitude === null && input.latitude === null) {
      utilisateur.logement.score_risques_adresse = undefined;
    }

    if (input.longitude && input.latitude) {
      await this.setRisqueFromCoordonnees(utilisateur);
    }

    new KycToTags_v2(
      utilisateur.kyc_history,
      utilisateur.logement,
      this.communeRepository,
      this.risquesNaturelsCommunesRepository,
    ).refreshTagState_v2(utilisateur.recommandation);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async setRisqueFromCoordonnees(utilisateur: Utilisateur) {
    if (utilisateur.logement.longitude && utilisateur.logement.latitude) {
      const scoring = await this.maifRepository.findScoreRisque(
        utilisateur.logement.longitude,
        utilisateur.logement.latitude,
      );
      utilisateur.logement.score_risques_adresse = scoring;
    }
  }
}
