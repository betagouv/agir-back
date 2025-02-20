import { Injectable } from '@nestjs/common';
import { Thematique } from '../domain/contenu/thematique';
import { ThematiqueSynthese } from '../domain/contenu/thematiqueSynthese';
import { ActionUsecase } from './actions.usecase';
import { AidesUsecase } from './aides.usecase';

@Injectable()
export class ThematiqueUsecase {
  constructor(
    private actionUsecase: ActionUsecase,
    private aidesUsecase: AidesUsecase,
  ) {}

  public async getListeThematiquesPrincipales(): Promise<ThematiqueSynthese[]> {
    const result = [];

    const alimentation: ThematiqueSynthese = {
      thematique: Thematique.alimentation,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.alimentation,
      ),
      nombre_aides: await this.aidesUsecase.countAides(Thematique.alimentation),
      nombre_recettes: 0,
      nombre_simulateurs: 0,
    };

    const logement: ThematiqueSynthese = {
      thematique: Thematique.logement,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.logement,
      ),
      nombre_aides: await this.aidesUsecase.countAides(Thematique.logement),
      nombre_recettes: 0,
      nombre_simulateurs: 0,
    };
    const transport: ThematiqueSynthese = {
      thematique: Thematique.transport,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.transport,
      ),
      nombre_aides: await this.aidesUsecase.countAides(Thematique.transport),
      nombre_recettes: 0,
      nombre_simulateurs: 0,
    };
    const consommation: ThematiqueSynthese = {
      thematique: Thematique.consommation,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.consommation,
      ),
      nombre_aides: await this.aidesUsecase.countAides(Thematique.consommation),
      nombre_recettes: 0,
      nombre_simulateurs: 0,
    };

    result.push(alimentation, logement, transport, consommation);

    return result;
  }
}
