import { Injectable } from '@nestjs/common';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { Suivi } from '../domain/suivi/suivi';
import { SuiviCollection } from '../domain/suivi/suiviCollection';
import { SuiviComplet } from '../domain/suivi/suiviComplet';
import { SuiviType } from 'src/domain/suivi/suiviType';

@Injectable()
export class SuiviUsecase {
  constructor(private suiviRepository: SuiviRepository) {}

  async createSuivi(suivi: Suivi, utilisateurId: string): Promise<Suivi> {
    suivi.calculImpacts();
    const idSuivi = await this.suiviRepository.createSuivi(
      suivi,
      utilisateurId,
    );
    suivi['id'] = idSuivi;
    return suivi;
  }
  async listeSuivi(
    utilisateurId: string,
    type?: SuiviType,
  ): Promise<SuiviCollection> {
    return this.suiviRepository.listAllSuivi(utilisateurId, type);
  }
  async getLastSuivi(
    utilisateurId: string,
    type?: SuiviType,
  ): Promise<Suivi | null> {
    return this.suiviRepository.getLastSuivi(utilisateurId, type);
  }
  async buildSuiviDashboard(utilisateurId: string): Promise<any> {
    let suiviCollection = await this.suiviRepository.listAllSuivi(
      utilisateurId,
      undefined,
      20,
    );
    const suiviCompletList = suiviCollection.getOrderedSuiviCompletList();
    if (suiviCompletList.length === 0) {
      return {};
    }
    const cleanLastSuiviData =
      suiviCompletList[suiviCompletList.length - 1].mergeAllToSingleSuivi();

    let derniers_totaux = [];
    suiviCompletList.forEach((suiviComplet) => {
      derniers_totaux.push({
        date: suiviComplet.getDate(),
        valeur: suiviComplet.computeTotalImpact(),
      });
    });
    return {
      date_dernier_suivi: cleanLastSuiviData.getDate(),
      impact_dernier_suivi: cleanLastSuiviData.getTotalImpact(),
      variation: SuiviComplet.computeLastVariationOfList(suiviCompletList),
      dernier_suivi: cleanLastSuiviData.cloneAndClean(),
      moyenne: SuiviComplet.computeMoyenne(suiviCompletList),
      derniers_totaux,
    };
  }
}
