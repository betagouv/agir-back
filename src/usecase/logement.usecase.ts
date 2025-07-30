import { Injectable } from '@nestjs/common';
import { Retryable } from 'typescript-retry-decorator';
import validator from 'validator';
import { LogementToKycSync } from '../domain/kyc/synchro/logementToKycSync';
import { Adresse } from '../domain/logement/adresse';
import { Logement } from '../domain/logement/logement';
import { KycToTags_v2 } from '../domain/scoring/system_v2/kycToTagsV2';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { InputLogementAPI } from '../infrastructure/api/types/utilisateur/logementAPI';
import { ApplicationError } from '../infrastructure/applicationError';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { RisquesNaturelsCommunesRepository } from '../infrastructure/repository/risquesNaturelsCommunes.repository';
import { MaifRepository } from '../infrastructure/repository/services_recherche/maif/maif.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

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
  async updateUtilisateurLogement(
    utilisateurId: string,
    input: InputLogementAPI,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement, Scope.kyc, Scope.recommandation],
    );
    Utilisateur.checkState(utilisateur);

    const data_to_update: Partial<Logement> = { ...input };

    const adresse_checker = new Adresse({
      code_commune: input.code_commune,
      code_postal: input.code_postal,
      id: undefined,
      date_creation: undefined,
      latitude: input.latitude,
      longitude: input.longitude,
      numero_rue: input.numero_rue,
      rue: input.rue,
    });

    // FIXME : hack à supprimer une fois que mobile n'utilise plus la commune en input
    if (input.commune && input.code_postal && !input.code_commune) {
      const code_commune =
        CommuneRepository.getCodeCommuneFromCodePostalEtNomCommune(
          input.code_postal,
          input.commune,
        );
      data_to_update.code_commune = code_commune;
      adresse_checker.code_commune = code_commune;
    }

    adresse_checker.checkAllFieldsSize();
    adresse_checker.checkCodePostalOK();
    adresse_checker.checkCodeCommuneOK();
    adresse_checker.checkCoordinatesOK();
    adresse_checker.checkBothCodePostalEtCodeCommuneOrNone();

    if (input.code_commune && input.code_postal) {
      adresse_checker.checkCodeCommuneAndCodePostalCoherent();
    }

    if (input.nombre_adultes) {
      if (!validator.isInt('' + input.nombre_adultes))
        ApplicationError.throwNbrAdultesEnfants();
    }
    if (input.nombre_enfants) {
      if (!validator.isInt('' + input.nombre_enfants))
        ApplicationError.throwNbrAdultesEnfants();
    }

    utilisateur.logement.patch(data_to_update, utilisateur);

    if (
      adresse_checker.hasAnyAdressData() &&
      utilisateur.logement.estPRMPresentEtParAdresse()
    ) {
      utilisateur.logement.est_prm_obsolete = true;
    }
    if (
      adresse_checker.hasNullifiedStreetData() &&
      utilisateur.logement.estPRMPresentEtParAdresse()
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

    if (adresse_checker.hasNullifiedCoordinates()) {
      utilisateur.logement.score_risques_adresse = undefined;
    }

    if (adresse_checker.hasAnyCoordinates()) {
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
