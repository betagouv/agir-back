import { Injectable } from '@nestjs/common';

import { AidesVeloRepository } from '../infrastructure/repository/aidesVelo.repository';

import { AidesRetrofitRepository } from '../infrastructure/repository/aidesRetrofit.repository';

import { AidesVeloParType, AideVelo } from '../domain/aides/aideVelo';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';
import { Aide } from '../../src/domain/aides/aide';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';

@Injectable()
export class AidesUsecase {
  constructor(
    private aidesVeloRepository: AidesVeloRepository,
    private aidesRetrofitRepository: AidesRetrofitRepository,
    private aideRepository: AideRepository,
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private personnalisator: Personnalisator,
  ) {}
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AideVelo[]> {
    return this.aidesRetrofitRepository.get(
      codePostal,
      revenuFiscalDeReference,
    );
  }

  async getCatalogueAides(utilisateurId: string): Promise<Aide[]> {
    const user = await this.utilisateurRepository.getById(utilisateurId);
    user.checkState();

    const code_commune = await this.communeRepository.getCodeCommune(
      user.logement.code_postal,
      user.logement.commune,
    );

    const dept_region =
      await this.communeRepository.findDepartementRegionByCodePostal(
        user.logement.code_postal,
      );

    const result = await this.aideRepository.search({
      code_postal: user.logement.code_postal,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
    });

    return this.personnalisator.personnaliser(result, user);
  }

  async simulerAideVelo(
    utilisateurId: string,
    prix_velo: number,
  ): Promise<AidesVeloParType> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const RFR =
      utilisateur.revenu_fiscal === null ? 0 : utilisateur.revenu_fiscal;
    const PARTS = utilisateur.getNombrePartsFiscalesOuEstimee();
    const ABONNEMENT =
      utilisateur.abonnement_ter_loire === null
        ? false
        : utilisateur.abonnement_ter_loire;

    return this.aidesVeloRepository.getSummaryVelos(
      utilisateur.logement.code_postal,
      RFR,
      PARTS,
      prix_velo,
      ABONNEMENT,
    );
  }
}
