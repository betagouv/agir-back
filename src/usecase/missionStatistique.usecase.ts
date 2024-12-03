import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Mission } from '../domain/mission/mission';
import { MissionStatistiqueRepository } from '../infrastructure/repository/thematiqueStatistique.repository';
import { Scope } from '../domain/utilisateur/utilisateur';
import { MissionRepository } from '../infrastructure/repository/mission.repository';

type MissionRecord = {
  titre: string;
  range_1_20: number;
  range_21_40: number;
  range_41_60: number;
  range_61_80: number;
  range_81_99: number;
  range_100: number;
};

@Injectable()
export class MissionStatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionStatistiqueRepository: MissionStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const missionRecord: Record<string, MissionRecord> = {};

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (const userId of listeUtilisateursIds) {
      const user = await this.utilisateurRepository.getById(userId, [
        Scope.missions,
      ]);

      for (const mission of user.missions.getRAWMissions()) {
        const pourcentageCompletionMission =
          this.calculPourcentageDeCompletion(mission);

        if (!missionRecord[mission.id_cms]) {
          missionRecord[mission.id_cms] = {
            titre: mission.code,
            range_1_20: 0,
            range_21_40: 0,
            range_41_60: 0,
            range_61_80: 0,
            range_81_99: 0,
            range_100: 0,
          };
        }

        this.incrementeRange(
          missionRecord[mission.id_cms],
          pourcentageCompletionMission,
        );
      }
    }

    const missionRecordEntries = Object.entries(missionRecord);

    for (const [key, value] of missionRecordEntries) {
      await this.missionStatistiqueRepository.upsert(
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

    const thematiqueListeId = Object.keys(missionRecord);

    return thematiqueListeId;
  }

  private calculPourcentageDeCompletion(mission: Mission): number {
    const { current, target } = mission.getProgression();
    return (current / target) * 100;
  }

  private incrementeRange(record: MissionRecord, pourcentage: number) {
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
