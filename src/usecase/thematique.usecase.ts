import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { TuileThematique } from '../domain/univers/tuileThematique';
import { MissionRepository } from '../infrastructure/repository/mission.repository';
import { Mission } from '../domain/mission/mission';
import { MissionUsecase } from './mission.usecase';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';

@Injectable()
export class ThematiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
    private missionUsecase: MissionUsecase,
    private personnalisator: Personnalisator,
  ) {}

  public ordonneTuilesThematiques(liste: TuileThematique[]): TuileThematique[] {
    liste.sort((a, b) => a.famille_ordre - b.famille_ordre);

    let famille_map: Map<Number, TuileThematique[]> = new Map();

    for (const tuile of liste) {
      const famille = famille_map.get(tuile.famille_ordre);
      if (famille) {
        famille.push(tuile);
      } else {
        famille_map.set(tuile.famille_ordre, [tuile]);
      }
    }

    let result = [];

    for (const [key] of famille_map) {
      famille_map.get(key).sort((a, b) => a.niveau - b.niveau);
      result = result.concat(famille_map.get(key));
    }
    return result;
  }
}
