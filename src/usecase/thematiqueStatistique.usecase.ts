import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Objectif } from '../../src/domain/mission/mission';
import { ThematiqueStatistiqueRepository } from '../../src/infrastructure/repository/thematiqueStatistique.repository';

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
    private thematiqueStatistiqueRepository: ThematiqueStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const thematiqueRecord: Record<string, ThematiqueRecord> = {};

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (const userId of listeUtilisateursIds) {
      const user = await this.utilisateurRepository.getById(userId);

      user.missions.missions.forEach((mission) => {
        const pourcentageCompletionMission = this.calculPourcentageDeCompletion(
          mission.objectifs,
        );

        if (!thematiqueRecord[mission.id]) {
          thematiqueRecord[mission.id] = {
            titre: mission.thematique_univers,
            range_1_20: 0,
            range_21_40: 0,
            range_41_60: 0,
            range_61_80: 0,
            range_81_99: 0,
            range_100: 0,
          };
        }

        this.incrementeRange(
          thematiqueRecord[mission.id],
          pourcentageCompletionMission,
        );
      });
    }

    const thematiqueRecordEntries = Object.entries(thematiqueRecord);

    for (const [key, value] of thematiqueRecordEntries) {
      await this.thematiqueStatistiqueRepository.upsertThematiqueStatistiques(
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

  private calculPourcentageDeCompletion(objectifs: Objectif[]): number {
    const objectifsCompletes = objectifs.filter(
      (objectif) => objectif.done_at !== null,
    );
    const totalObjectifs = objectifs.length;
    const totalObjectifsCompletes = objectifsCompletes.length;
    const pourcentageCompletion =
      (totalObjectifsCompletes / totalObjectifs) * 100;

    return pourcentageCompletion;
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
