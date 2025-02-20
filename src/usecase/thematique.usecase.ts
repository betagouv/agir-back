import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { DefiStatus } from '../../src/domain/defis/defi';
import {
  MissionDefinition,
  ObjectifDefinition,
} from '../domain/mission/missionDefinition';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import {
  ArticleFilter,
  ArticleRepository,
} from '../infrastructure/repository/article.repository';
import { Categorie } from '../domain/contenu/categorie';
import { PonderationApplicativeManager } from '../domain/scoring/ponderationApplicative';
import { TuileMission } from '../domain/thematique/tuileMission';
import { Thematique } from '../domain/contenu/thematique';
import { PriorityContent } from '../domain/scoring/priorityContent';
import { Article } from '../domain/contenu/article';

@Injectable()
export class ThematiqueUsecase {
  constructor() {}

  public async getListeThematiquesPrincipales(): Promise<Thematique[]> {
    return [
      Thematique.alimentation,
      Thematique.consommation,
      Thematique.logement,
      Thematique.transport,
    ];
  }
}
