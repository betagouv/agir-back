import { Injectable } from '@nestjs/common';
import { FiltreRecherche } from '../domain/bibliotheque_services/recherche/filtreRecherche';
import { ScoreRisquesAdresse } from '../domain/logement/logement';
import { RisquesNaturelsCommunesDefinition } from '../domain/logement/RisquesNaturelsCommuneDefinition';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  Commune,
  CommuneRepository,
} from '../infrastructure/repository/commune/commune.repository';
import { RisquesNaturelsCommunesRepository } from '../infrastructure/repository/risquesNaturelsCommunes.repository';
import { MaifRepository } from '../infrastructure/repository/services_recherche/maif/maif.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class RisquesUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private risqueRepository: RisquesNaturelsCommunesRepository,
    private communeRepository: CommuneRepository,
    private maifRepository: MaifRepository,
  ) {}

  public async getRisquesAdresseUtilisateur(
    utilisateurId: string,
    longitude?: number,
    latitude?: number,
  ): Promise<ScoreRisquesAdresse> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    if (
      (!utilisateur.logement.longitude || !utilisateur.logement.latitude) &&
      !(longitude || latitude)
    ) {
      ApplicationError.throwUserMissingAdresse();
    }

    if ((!latitude && longitude) || (latitude && !longitude)) {
      ApplicationError.throwIncompleteCoordonnees();
    }

    if (latitude && longitude) {
      return await this.maifRepository.findScoreRisque(longitude, latitude);
    }

    if (utilisateur.logement.score_risques_adresse) {
      return utilisateur.logement.score_risques_adresse;
    }

    if (utilisateur.logement.longitude) {
      return await this.maifRepository.findScoreRisque(
        utilisateur.logement.longitude,
        utilisateur.logement.latitude,
      );
    }

    return new ScoreRisquesAdresse({
      argile: undefined,
      inondation: undefined,
      radon: undefined,
      secheresse: undefined,
      seisme: undefined,
      submersion: undefined,
      tempete: undefined,
    });
  }

  public async getRisquesCommuneUtilisateur(
    utilisateurId: string,
    code_commune?: string,
  ): Promise<RisquesNaturelsCommunesDefinition> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    if (!utilisateur.logement.code_commune && !code_commune) {
      ApplicationError.throwUserMissingCommune();
    }
    let commune: Commune;
    if (code_commune) {
      commune =
        this.communeRepository.getCommuneByCodeINSEESansArrondissement(
          code_commune,
        );

      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }
    } else {
      commune = this.communeRepository.getCommuneByCodeINSEESansArrondissement(
        utilisateur.logement.code_commune,
      );
    }

    let risques = this.risqueRepository.getRisquesCommune(commune.code);
    if (!risques) {
      risques = await this.computeRisquesCommuneFromExternalAPI(commune);
      if (risques.nombre_cat_nat !== undefined) {
        await this.risqueRepository.upsert(risques);
      }
    }

    return risques;
  }

  private async computeRisquesCommuneFromExternalAPI(
    commune: Commune,
  ): Promise<RisquesNaturelsCommunesDefinition> {
    const risques = new RisquesNaturelsCommunesDefinition();
    risques.code_commune = commune.code;
    risques.nom_commune = commune.nom;

    const filtre: FiltreRecherche = {
      code_commune: commune.code,
      silent_error: true,
    };

    const synthese = await this.maifRepository.findRisqueCommuneSynthese(
      filtre,
    );

    if (synthese) {
      risques.nombre_cat_nat = synthese.catnat;
      risques.pourcentage_risque_innondation = Math.round(
        synthese.pourcent_inondation,
      );
      risques.pourcentage_risque_secheresse = Math.round(
        synthese.pourcent_secheresse,
      );
    }

    return risques;
  }
}
