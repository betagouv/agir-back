import { Injectable } from '@nestjs/common';
import { FiltreRecherche } from '../domain/bibliotheque_services/recherche/filtreRecherche';
import { ResultatRecherche } from '../domain/bibliotheque_services/recherche/resultatRecherche';
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
      commune = this.communeRepository.getCommuneByCodeINSEE(code_commune);

      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }
    } else {
      commune = this.communeRepository.getCommuneByCodeINSEE(
        utilisateur.logement.code_commune,
      );
    }

    let risques = this.risqueRepository.getRisquesCommune(commune.code);
    if (!risques) {
      risques = await this.computeRisquesCommuneFromExternalAPI(commune);

      await this.risqueRepository.upsert(risques);
    }

    if (
      risques.surface_totale &&
      risques.secheresse_surface_zone5 !== null &&
      risques.secheresse_surface_zone4 !== null &&
      risques.secheresse_surface_zone3 !== null
    ) {
      risques.pourcentage_risque_secheresse = Math.round(
        ((risques.secheresse_surface_zone5 +
          risques.secheresse_surface_zone4 +
          risques.secheresse_surface_zone3) /
          risques.surface_totale) *
          100,
      );
    } else {
      risques.pourcentage_risque_secheresse = null;
    }

    if (
      risques.inondation_surface_zone5 !== null &&
      risques.inondation_surface_zone4 !== null &&
      risques.inondation_surface_zone3 !== null &&
      risques.inondation_surface_zone2 !== null &&
      risques.inondation_surface_zone1 !== null
    ) {
      const surface_totale_inondation =
        risques.inondation_surface_zone5 +
        risques.inondation_surface_zone4 +
        risques.inondation_surface_zone3 +
        risques.inondation_surface_zone2 +
        risques.inondation_surface_zone1;

      risques.pourcentage_risque_innondation = Math.round(
        ((risques.inondation_surface_zone5 +
          risques.inondation_surface_zone4 +
          risques.inondation_surface_zone3) /
          surface_totale_inondation) *
          100,
      );
    } else {
      risques.pourcentage_risque_innondation = null;
    }

    return risques;
  }

  private zone_surface_value(zone: string, resultats: ResultatRecherche[]) {
    const found = resultats.find((a) => a.id === `zone_${zone}_surface`);
    return found ? found.surface_m_2 : 0;
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

    risques.surface_totale = await this.maifRepository.findSurfaceCommune(
      filtre,
    );

    const risques_catnat = await this.maifRepository.findCatnat(filtre);
    risques.nombre_cat_nat = risques_catnat.length;

    const risques_zones_secheresse =
      await this.maifRepository.findZonesSecheresse(filtre);

    if (risques_zones_secheresse.length > 0) {
      risques.secheresse_surface_zone1 = this.zone_surface_value(
        '1',
        risques_zones_secheresse,
      );
      risques.secheresse_surface_zone2 = this.zone_surface_value(
        '2',
        risques_zones_secheresse,
      );
      risques.secheresse_surface_zone3 = this.zone_surface_value(
        '3',
        risques_zones_secheresse,
      );
      risques.secheresse_surface_zone4 = this.zone_surface_value(
        '4',
        risques_zones_secheresse,
      );
      risques.secheresse_surface_zone5 = this.zone_surface_value(
        '5',
        risques_zones_secheresse,
      );
    } else {
      risques.secheresse_surface_zone1 = null;
      risques.secheresse_surface_zone2 = null;
      risques.secheresse_surface_zone3 = null;
      risques.secheresse_surface_zone4 = null;
      risques.secheresse_surface_zone5 = null;
      risques.pourcentage_risque_secheresse = null;
    }

    const risques_zones_inondation =
      await this.maifRepository.findZonesInondation(
        filtre,
        risques.surface_totale,
      );
    if (risques_zones_inondation.length > 0) {
      risques.inondation_surface_zone1 = this.zone_surface_value(
        '1',
        risques_zones_inondation,
      );
      risques.inondation_surface_zone2 = this.zone_surface_value(
        '2',
        risques_zones_inondation,
      );
      risques.inondation_surface_zone3 = this.zone_surface_value(
        '3',
        risques_zones_inondation,
      );
      risques.inondation_surface_zone4 = this.zone_surface_value(
        '4',
        risques_zones_inondation,
      );
      risques.inondation_surface_zone5 = this.zone_surface_value(
        '5',
        risques_zones_inondation,
      );
    } else {
      risques.inondation_surface_zone1 = null;
      risques.inondation_surface_zone2 = null;
      risques.inondation_surface_zone3 = null;
      risques.inondation_surface_zone4 = null;
      risques.inondation_surface_zone5 = null;
      risques.pourcentage_risque_innondation = null;
    }
    return risques;
  }
}
