import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../infrastructure/repository/utilisateur/utilisateur.repository';
import { Mission } from '../../domain/mission/mission';
import { ThematiqueStatistiqueRepository } from '../../infrastructure/repository/universStatistique.repository';
import { Scope } from '../../domain/utilisateur/utilisateur';

type ThematiqueRecord = {
  titre: string;
  range_1_20: number;
  range_21_40: number;
  range_41_60: number;
  range_61_80: number;
  range_81_99: number;
  range_100: number;
};

@Injectable()
export class ThematiqueStatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private universStatistiqueRepository: ThematiqueStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const thematiqueRecord: Record<string, ThematiqueRecord> = {};

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (const userId of listeUtilisateursIds) {
      const missionRecord: Record<string, number[]> = {};

      const user = await this.utilisateurRepository.getById(userId, [
        Scope.missions,
      ]);

      for (const mission of user.missions.getRAWMissions()) {
        const pourcentageCompletionMission =
          this.calculPourcentageDeCompletion(mission);

        if (!missionRecord[mission.thematique]) {
          missionRecord[mission.thematique] = [pourcentageCompletionMission];
        } else {
          missionRecord[mission.thematique].push(pourcentageCompletionMission);
        }
      }

      for (const mission in missionRecord) {
        const sum = missionRecord[mission].reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        );
        const pourcentageCompletionThematique =
          sum / missionRecord[mission].length;

        if (!thematiqueRecord[mission]) {
          thematiqueRecord[mission] = {
            titre: mission,
            range_1_20: 0,
            range_21_40: 0,
            range_41_60: 0,
            range_61_80: 0,
            range_81_99: 0,
            range_100: 0,
          };
        }

        this.incrementeRange(
          thematiqueRecord[mission],
          pourcentageCompletionThematique,
        );
      }
    }

    for (const [key, value] of Object.entries(thematiqueRecord)) {
      await this.universStatistiqueRepository.upsert(
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

    const thematiqueListeId = Object.keys(thematiqueRecord);

    return thematiqueListeId;
  }

  private calculPourcentageDeCompletion(mission: Mission): number {
    const { current, target } = mission.getProgression();
    return (current / target) * 100;
  }

  private incrementeRange(record: ThematiqueRecord, pourcentage: number) {
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
