import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { StatistiqueRepository } from '../../src/infrastructure/repository/statitstique.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';

@Injectable()
export class StatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private statistiqueRepository: StatistiqueRepository,
  ) {}

  async calculStatistiqueDefis(): Promise<string[]> {
    const utilisateurIds =
      await this.utilisateurRepository.listUtilisateurIds();
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
      } = this.calculerThematiques(user);

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

  private calculerThematiques(user: Utilisateur) {
    const universCompletions: Record<
      string,
      { termines: boolean; enCours: boolean }
    > = {};

    const thematiquesTerminees: string[] = [];
    const thematiquesEnCours: string[] = [];

    user.missions.missions.forEach((mission) => {
      const pourcentageCompletion = this.calculPourcentageDeCompletion(mission);

      const universParent = ThematiqueRepository.getUniversParent(
        mission.thematique_univers,
      );

      if (!universCompletions[universParent]) {
        universCompletions[universParent] = {
          termines: false,
          enCours: false,
        };
      }

      if (pourcentageCompletion === 100) {
        thematiquesTerminees.push(mission.thematique_univers);

        if (!universCompletions[universParent].enCours) {
          universCompletions[universParent].termines = true;
        }
      } else if (pourcentageCompletion > 0) {
        thematiquesEnCours.push(mission.thematique_univers);
        universCompletions[universParent].enCours = true;

        if (!universCompletions[universParent].enCours) {
          universCompletions[universParent].termines = false;
        }
      }
    });

    const universTermines = Object.entries(universCompletions)
      .filter(([key, value]) => value.termines)
      .map(([key]) => key);

    const universEncours = Object.entries(universCompletions)
      .filter(([key, value]) => value.enCours)
      .map(([key]) => key);

    const thematiquesTermineesAsc = thematiquesTerminees.length
      ? this.ordonnerEtStringifier(thematiquesTerminees)
      : null;
    const thematiquesEnCoursAsc = thematiquesEnCours.length
      ? this.ordonnerEtStringifier(thematiquesEnCours)
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
