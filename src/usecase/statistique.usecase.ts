import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { StatistiqueRepository } from '../../src/infrastructure/repository/statitstique.repository';
import { Objectif } from '../../src/domain/mission/mission';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';

@Injectable()
export class StatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private statistiqueRepository: StatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const utilisateurIds =
      await this.utilisateurRepository.listUtilisateurIds();
    const reponse: string[] = [];

    for (const userId of utilisateurIds) {
      const user = await this.utilisateurRepository.getById(userId);

      const { thematiquesTermineesAsc, thematiquesEnCoursAsc } =
        this.calculerThematiques(user);

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
      );

      reponse.push(user.id);
    }

    return reponse;
  }

  private calculerThematiques(user: Utilisateur) {
    const thematiquesTerminees: string[] = [];
    const thematiquesEnCours: string[] = [];

    user.missions.missions.forEach((mission) => {
      const pourcentageCompletion = this.calculerPourcentageDeCompletion(
        mission.objectifs,
      );

      if (pourcentageCompletion === 100) {
        thematiquesTerminees.push(mission.thematique_univers);
      } else if (pourcentageCompletion > 0) {
        thematiquesEnCours.push(mission.thematique_univers);
      }
    });

    const thematiquesTermineesAsc = thematiquesTerminees.length
      ? this.ordonnerEtStringifier(thematiquesTerminees)
      : null;
    const thematiquesEnCoursAsc = thematiquesEnCours.length
      ? this.ordonnerEtStringifier(thematiquesEnCours)
      : null;

    return { thematiquesTermineesAsc, thematiquesEnCoursAsc };
  }

  private calculerPourcentageDeCompletion(objectifs: Objectif[]): number {
    const totalObjectifs = objectifs.length;
    const totalObjectifsCompletes = objectifs.filter(
      (objectif) => objectif.done_at !== null,
    ).length;

    return (totalObjectifsCompletes / totalObjectifs) * 100;
  }

  private ordonnerEtStringifier(array: string[]): string {
    return array.sort().join(', ');
  }
}
