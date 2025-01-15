import { Injectable } from '@nestjs/common';

import { AidesVeloRepository } from '../infrastructure/repository/aidesVelo.repository';

import { AidesRetrofitRepository } from '../infrastructure/repository/aidesRetrofit.repository';

import { AidesVeloParType, AideVelo } from '../domain/aides/aideVelo';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { AideExpirationWarningRepository } from '../infrastructure/repository/aideExpirationWarning.repository';

@Injectable()
export class AidesUsecase {
  constructor(
    private aidesVeloRepository: AidesVeloRepository,
    private aideExpirationWarningRepository: AideExpirationWarningRepository,
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

  async exportAides(): Promise<AideDefinition[]> {
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

  async clickAideInfosLink(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = await this.aideRepository.exists(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.clickAideInfosLink(id_cms);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
  async clickAideDemandeLink(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = await this.aideRepository.exists(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.clickAideDemandeLink(id_cms);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getCatalogueAides(
    utilisateurId: string,
  ): Promise<{ aides: AideDefinition[]; utilisateur: Utilisateur }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement, Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const code_commune = await this.communeRepository.getCodeCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );

    const dept_region =
      await this.communeRepository.findDepartementRegionByCodePostal(
        utilisateur.logement.code_postal,
      );

    const result = await this.aideRepository.search({
      code_postal: utilisateur.logement.code_postal,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
      date_expiration: new Date(),
    });

    for (const aide of result) {
      const aide_hist = utilisateur.history.getAideInteractionByIdCms(
        aide.content_id,
      );
      if (aide_hist) {
        aide.clicked_demande = aide_hist.clicked_demande;
        aide.clicked_infos = aide_hist.clicked_infos;
      }
    }

    return {
      aides: this.personnalisator.personnaliser(result, utilisateur),
      utilisateur: utilisateur,
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
    const commune = this.communeRepository.getCommuneByCodeINSEE(code_insee);
    const epci = this.communeRepository.getEPCIByCommuneCodeINSEE(code_insee);

    return this.aidesVeloRepository.getSummaryVelos({
      'localisation . code insee': code_insee,
      'localisation . epci': epci?.nom,
      'localisation . région': commune?.region,
      'localisation . département': commune?.departement,
      'vélo . prix': prix_velo,
      'aides . pays de la loire . abonné TER': ABONNEMENT,
      'foyer . personnes': utilisateur.getNombrePersonnesDansLogement(),
      'revenu fiscal de référence par part . revenu de référence': RFR,
      'revenu fiscal de référence par part . nombre de parts': PARTS,
    });
  }

  public async reportAideSoonExpired(): Promise<string[]> {
    const result = [];
    const liste_aide_all = await this.aideRepository.listAll();

    const day = 1000 * 60 * 60 * 24;
    const week = day * 7;
    const month = day * 30;

    const NOW = Date.now();

    for (const aide of liste_aide_all) {
      if (aide.date_expiration) {
        const month_warning = aide.date_expiration.getTime() - month < NOW;
        const week_warning = aide.date_expiration.getTime() - week < NOW;

        if (month_warning || week_warning) {
          await this.aideExpirationWarningRepository.upsert({
            aide_cms_id: aide.content_id,
            last_month: month_warning,
            last_week: week_warning,
          });
          result.push(
            `SET : ${aide.content_id}:M[${month_warning}]W[${week_warning}]`,
          );
        } else {
          await this.aideExpirationWarningRepository.delete(aide.content_id);
          result.push(`REMOVED : ${aide.content_id}`);
        }
      }
    }
    return result;
  }
}
