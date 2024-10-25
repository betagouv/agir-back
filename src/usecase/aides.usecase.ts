import { Injectable } from '@nestjs/common';

import { AidesVeloRepository } from '../infrastructure/repository/aidesVelo.repository';

import { AidesRetrofitRepository } from '../infrastructure/repository/aidesRetrofit.repository';

import { AidesVeloParType, AideVelo } from '../domain/aides/aideVelo';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';
import { Aide } from '../../src/domain/aides/aide';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';

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

  async exportAides(): Promise<Aide[]> {
    const liste = await this.aideRepository.listAll();
    for (const aide of liste) {
      const metropoles = new Set<string>();
      const cas = new Set<string>();
      const cus = new Set<string>();
      const ccs = new Set<string>();
      for (const code_postal of aide.codes_postaux) {
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'METRO')
          .map((m) => metropoles.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CA')
          .map((m) => cas.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CC')
          .map((m) => ccs.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CU')
          .map((m) => cus.add(m));
      }
      aide.ca = Array.from(cas.values());
      aide.cc = Array.from(ccs.values());
      aide.cu = Array.from(cus.values());
      aide.metropoles = Array.from(metropoles.values());
    }
    liste.sort((a, b) => parseInt(a.content_id) - parseInt(b.content_id));
    return liste;
  }

  async getCatalogueAides(
    utilisateurId: string,
  ): Promise<{ aides: Aide[]; utilisateur: Utilisateur }> {
    const user = await this.utilisateurRepository.getById(utilisateurId, [
      Scope.logement,
    ]);
    Utilisateur.checkState(user);

    const code_commune = this.communeRepository.getCodeCommune(
      user.logement.code_postal,
      user.logement.commune,
    );

    const dept_region =
      this.communeRepository.findDepartementRegionByCodePostal(
        user.logement.code_postal,
      );

    const result = await this.aideRepository.search({
      code_postal: user.logement.code_postal,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
    });

    return {
      aides: this.personnalisator.personnaliser(result, user),
      utilisateur: user,
    };
  }

  async simulerAideVelo(
    utilisateurId: string,
    prix_velo: number,
  ): Promise<AidesVeloParType> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const RFR =
      utilisateur.revenu_fiscal === null ? 0 : utilisateur.revenu_fiscal;
    const PARTS = utilisateur.getNombrePartsFiscalesOuEstimee();
    const ABONNEMENT =
      utilisateur.abonnement_ter_loire === null
        ? false
        : utilisateur.abonnement_ter_loire;

    const code_insee = this.communeRepository.getCodeCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );

    return this.aidesVeloRepository.getSummaryVelos({
      'localisation . code insee': code_insee,
      'vélo . prix': prix_velo,
      'aides . pays de la loire . abonné TER': ABONNEMENT,
      'foyer . personnes': utilisateur.getNombrePersonnesDansLogement(),
      'revenu fiscal de référence par part . revenu de référence': RFR,
      'revenu fiscal de référence par part . nombre de parts': PARTS,
    });
  }
}
