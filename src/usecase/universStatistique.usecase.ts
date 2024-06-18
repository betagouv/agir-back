import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Mission } from '../../src/domain/mission/mission';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { UniversStatistiqueRepository } from '../../src/infrastructure/repository/universStatistique.repository';

type UniversRecord = {
  titre: string;
  range_1_20: number;
  range_21_40: number;
  range_41_60: number;
  range_61_80: number;
  range_81_99: number;
  range_100: number;
};

@Injectable()
export class UniversStatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private universStatistiqueRepository: UniversStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const universRecord: Record<string, UniversRecord> = {};

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (const userId of listeUtilisateursIds) {
      const thematiqueRecord: Record<string, number[]> = {};

      const user = await this.utilisateurRepository.getById(userId);

      user.missions.missions.forEach((mission) => {
        const pourcentageCompletionMission =
          this.calculPourcentageDeCompletion(mission);

        const universParent = ThematiqueRepository.getUniversParent(
          mission.thematique_univers,
        );

        if (!thematiqueRecord[universParent]) {
          thematiqueRecord[universParent] = [pourcentageCompletionMission];
        } else {
          thematiqueRecord[universParent].push(pourcentageCompletionMission);
        }
      });

      for (const thematique in thematiqueRecord) {
        const sum = thematiqueRecord[thematique].reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        );
        const pourcentageCompletionUnivers =
          sum / thematiqueRecord[thematique].length;

        if (!universRecord[thematique]) {
          universRecord[thematique] = {
            titre: thematique,
            range_1_20: 0,
            range_21_40: 0,
            range_41_60: 0,
            range_61_80: 0,
            range_81_99: 0,
            range_100: 0,
          };
        }

        this.incrementeRange(
          universRecord[thematique],
          pourcentageCompletionUnivers,
        );
      }
    }

    for (const [key, value] of Object.entries(universRecord)) {
      await this.universStatistiqueRepository.upsertUniversStatistiques(
        key,
        value.titre,
        value.range_1_20,
        value.range_21_40,
        value.range_41_60,
        value.range_61_80,
        value.range_81_99,
        value.range_100,
      );
    }

    const universListeId = Object.keys(universRecord);

    return universListeId;
  }

  private calculPourcentageDeCompletion(mission: Mission): number {
    const { current, target } = mission.getProgression();
    return (current / target) * 100;
  }

  private incrementeRange(record: UniversRecord, pourcentage: number) {
    let rangeKey;
    switch (true) {
      case pourcentage > 0 && pourcentage <= 20:
        rangeKey = 'range_1_20';
        break;
      case pourcentage > 20 && pourcentage <= 40:
        rangeKey = 'range_21_40';
        break;
      case pourcentage > 40 && pourcentage <= 60:
        rangeKey = 'range_41_60';
        break;
      case pourcentage > 60 && pourcentage <= 80:
        rangeKey = 'range_61_80';
        break;
      case pourcentage > 80 && pourcentage <= 99:
        rangeKey = 'range_81_99';
        break;
      case pourcentage === 100:
        rangeKey = 'range_100';
        break;
      default:
        rangeKey = null;
    }

    if (rangeKey) {
      record[rangeKey]++;
    }
  }
}
