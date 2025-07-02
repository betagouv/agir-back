import { Injectable } from '@nestjs/common';

import {
  AidesVeloRepository,
  SummaryVelosParams,
} from '../infrastructure/repository/aidesVelo.repository';

import {
  Commune,
  CommuneRepository,
  EPCI,
} from '../../src/infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  AidesVeloParType,
  AideVeloNonCalculee,
} from '../domain/aides/aideVelo';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';

@Injectable()
export class AidesVeloUsecase {
  constructor(
    private aidesVeloRepository: AidesVeloRepository,
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async simulerAideVelo(
    utilisateurId: string,
    prix_velo: number,
    etat_velo: 'neuf' | 'occasion' = 'neuf',
    situation_handicap: boolean = false,
  ): Promise<AidesVeloParType> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const revenu_reference =
      utilisateur.revenu_fiscal === null ? 0 : utilisateur.revenu_fiscal;
    const nb_parts_fiscales = utilisateur.getNombrePartsFiscalesOuEstimee();
    const code_insee =
      utilisateur.logement.code_commune ??
      this.communeRepository.getCommuneCodeInsee(
        utilisateur.logement.code_postal,
        utilisateur.logement.commune,
      );

    const commune = this.communeRepository.getCommuneByCodeINSEE(code_insee);
    const epci = this.communeRepository.getEPCIByCommuneCodeINSEE(code_insee);
    const age = utilisateur.annee_naissance
      ? new Date().getFullYear() - utilisateur.annee_naissance
      : undefined;

    const inputs: SummaryVelosParams = {
      'localisation . code insee': code_insee,
      'localisation . epci': epci?.nom,
      'localisation . région': commune?.region,
      'localisation . département': commune?.departement,
      'vélo . prix': prix_velo,
      'foyer . personnes': utilisateur.getNombrePersonnesDansLogement(),
      'revenu fiscal de référence par part . revenu de référence':
        revenu_reference,
      'revenu fiscal de référence par part . nombre de parts':
        nb_parts_fiscales,
      'vélo . état': etat_velo,
      'demandeur . en situation de handicap': situation_handicap,
      'demandeur . âge': age,
    };

    return this.aidesVeloRepository.getSummaryVelos(inputs);
  }

  /**
   * Récupère toutes les aides disponible pour une commune ou un EPCI donné.
   *
   * @param code - Le code INSEE de la commune ou le code SIREN de l'EPCI.
   * @returns La liste de toutes aides disponible pour la commune ou l'EPCI donné.
   *
   * @note Les aides ne sont pas calculées et peuvent donc ne pas être éligibles pour certaines personnes.
   */
  async recupererToutesLesAidesDisponiblesParCommuneOuEPCI(
    code: string,
  ): Promise<AideVeloNonCalculee[]> {
    const isEPCI = this.communeRepository.isCodeSirenEPCI(code);
    const commune: Commune | undefined = isEPCI
      ? undefined
      : this.communeRepository.getCommuneByCodeINSEE(code);
    const epci: EPCI | undefined = isEPCI
      ? this.communeRepository.getEPCIBySIRENCode(code)
      : this.communeRepository.getEPCIByCommuneCodeINSEE(code);

    const codeCommuneDeEPCI = epci?.membres[0].code;
    const communeDeEPCI =
      this.communeRepository.getCommuneByCodeINSEE(codeCommuneDeEPCI);
    const region = isEPCI ? communeDeEPCI?.region : commune?.region;
    const departement = isEPCI
      ? communeDeEPCI?.departement
      : commune?.departement;

    return this.aidesVeloRepository.getAllAidesIn({
      'localisation . pays': 'France',
      'localisation . code insee': isEPCI ? undefined : commune?.code,
      'localisation . epci': epci?.nom,
      'localisation . région': region,
      'localisation . département': departement,
    });
  }
}
