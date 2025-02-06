import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { StatistiqueRepository } from '../../../src/infrastructure/repository/statitstique.repository';
import { Mission } from '../../../src/domain/mission/mission';
import {
  Scope,
  Utilisateur,
} from '../../../src/domain/utilisateur/utilisateur';

@Injectable()
export class StatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private statistiqueRepository: StatistiqueRepository,
  ) {}

  async calculStatistiqueDefis(): Promise<string[]> {
    const utilisateurIds = await this.utilisateurRepository.listUtilisateurIds(
      {},
    );
    const reponse: string[] = [];

    for (const userId of utilisateurIds) {
      const user = await this.utilisateurRepository.getById(userId, [
        Scope.defis,
        Scope.missions,
      ]);

      const {
        thematiquesTermineesAsc,
        thematiquesEnCoursAsc,
        universTerminesAsc,
        universEncoursAsc,
      } = this.calculerMissions(user);

      const nombreDefisEnCours = user.defi_history.getNombreDefisEnCours();
      const nombreDefisRealises = user.defi_history.getNombreDefisRealises();
      const nombreDefisAbandonnes =
        user.defi_history.getNombreDefisAbandonnes();
      const nombreDefisPasEnvie = user.defi_history.getNombreDefisPasEnvie();

      await this.statistiqueRepository.upsertStatistiquesDUnUtilisateur(
        user.id,
        nombreDefisEnCours,
        nombreDefisRealises,
        nombreDefisAbandonnes,
        nombreDefisPasEnvie,
        thematiquesTermineesAsc,
        thematiquesEnCoursAsc,
        universTerminesAsc,
        universEncoursAsc,
      );

      reponse.push(user.id);
    }

    return reponse;
  }

  private calculerMissions(user: Utilisateur) {
    const thematiqueCompletions: Record<
      string,
      { termines: boolean; enCours: boolean }
    > = {};

    const missionsTerminees: string[] = [];
    const missionsEnCours: string[] = [];

    for (const mission of user.missions.getRAWMissions()) {
      const pourcentageCompletion = this.calculPourcentageDeCompletion(mission);

      if (!thematiqueCompletions[mission.thematique]) {
        thematiqueCompletions[mission.thematique] = {
          termines: false,
          enCours: false,
        };
      }

      if (pourcentageCompletion === 100) {
        missionsTerminees.push(mission.code);

        if (!thematiqueCompletions[mission.thematique].enCours) {
          thematiqueCompletions[mission.thematique].termines = true;
        }
      } else if (pourcentageCompletion > 0) {
        missionsEnCours.push(mission.code);
        thematiqueCompletions[mission.thematique].enCours = true;

        if (!thematiqueCompletions[mission.thematique].enCours) {
          thematiqueCompletions[mission.thematique].termines = false;
        }
      }
    }

    const universTermines = Object.entries(thematiqueCompletions)
      .filter(([key, value]) => value.termines)
      .map(([key]) => key);

    const universEncours = Object.entries(thematiqueCompletions)
      .filter(([key, value]) => value.enCours)
      .map(([key]) => key);

    const thematiquesTermineesAsc = missionsTerminees.length
      ? this.ordonnerEtStringifier(missionsTerminees)
      : null;
    const thematiquesEnCoursAsc = missionsEnCours.length
      ? this.ordonnerEtStringifier(missionsEnCours)
      : null;
    const universTerminesAsc = universTermines.length
      ? this.ordonnerEtStringifier(universTermines)
      : null;
    const universEncoursAsc = universEncours.length
      ? this.ordonnerEtStringifier(universEncours)
      : null;

    return {
      thematiquesTermineesAsc,
      thematiquesEnCoursAsc,
      universTerminesAsc,
      universEncoursAsc,
    };
  }

  private calculPourcentageDeCompletion(mission: Mission): number {
    const { current, target } = mission.getProgression();
    return (current / target) * 100;
  }

  private ordonnerEtStringifier(array: string[]): string {
    return array.sort().join(', ');
  }
}
