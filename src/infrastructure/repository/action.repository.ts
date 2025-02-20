import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Action } from '@prisma/client';
import { Thematique } from '../../domain/contenu/thematique';
import { Cron } from '@nestjs/schedule';
import { ActionDefinition } from '../../domain/actions/actionDefinition';
import { TypeAction } from '../../domain/actions/typeAction';
import { CategorieRecherche } from '../../domain/bibliotheque_services/recherche/categorieRecherche';

export type ActionFilter = {
  thematique?: Thematique;
};

@Injectable()
export class ActionRepository {
  constructor(private prisma: PrismaService) {
    ActionRepository.catalogue = [];
  }

  private static catalogue: ActionDefinition[];

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadActions();
    } catch (error) {
      console.error(
        `Error loading Action definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadActions(): Promise<void> {
    const result = await this.prisma.action.findMany();
    ActionRepository.catalogue = result.map((elem) =>
      this.buildActionDefinitionFromDB(elem),
    );
  }

  public static resetCache() {
    // FOR TEST ONLY
    ActionRepository.catalogue = [];
  }

  public static getCatalogue(): ActionDefinition[] {
    return ActionRepository.catalogue;
  }

  async upsert(action: ActionDefinition): Promise<void> {
    const action_db: Action = {
      cms_id: action.cms_id,
      code: action.code,
      titre: action.titre,
      thematique: action.thematique,
      besoins: action.besoins,
      comment: action.comment,
      kyc_ids: action.kyc_ids,
      lvo_action: action.lvo_action,
      lvo_objet: action.lvo_objet,
      pourquoi: action.pourquoi,
      quizz_ids: action.quizz_ids,
      recette_categorie: action.recette_categorie,
      sous_titre: action.sous_titre,
      type: action.type,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.action.upsert({
      where: {
        code_type: {
          code: action.code,
          type: action.type,
        },
      },
      create: {
        ...action_db,
      },
      update: {
        ...action_db,
      },
    });
  }
  async delete(cms_id: string, type: TypeAction): Promise<void> {
    await this.prisma.action.delete({
      where: {
        cms_id_type: {
          cms_id: cms_id,
          type: type,
        },
      },
    });
  }

  async count(filter: ActionFilter): Promise<number> {
    const query = this.buildActionQuery(filter);

    return await this.prisma.action.count(query);
  }

  async list(filter: ActionFilter): Promise<ActionDefinition[]> {
    const query = this.buildActionQuery(filter);

    const result = await this.prisma.action.findMany(query);

    return result.map((elem) => this.buildActionDefinitionFromDB(elem));
  }

  private buildActionQuery(filtre: ActionFilter): any {
    const main_filter = {};

    if (filtre.thematique) {
      main_filter['thematique'] = filtre.thematique;
    }

    return {
      where: {
        AND: main_filter,
      },
    };
  }

  async getByCodeAndType(
    code: string,
    type: string,
  ): Promise<ActionDefinition> {
    const result = await this.prisma.action.findUnique({
      where: {
        code_type: {
          code: code,
          type: type,
        },
      },
    });
    return this.buildActionDefinitionFromDB(result);
  }

  private buildActionDefinitionFromDB(action: Action): ActionDefinition {
    if (action === null) return null;
    return new ActionDefinition({
      cms_id: action.cms_id,
      titre: action.titre,
      code: action.code,
      thematique: Thematique[action.thematique],
      comment: action.comment,
      pourquoi: action.pourquoi,
      besoins: action.besoins,
      kyc_ids: action.kyc_ids,
      lvo_action: CategorieRecherche[action.lvo_action],
      lvo_objet: action.lvo_objet,
      quizz_ids: action.quizz_ids,
      recette_categorie: CategorieRecherche[action.recette_categorie],
      sous_titre: action.sous_titre,
      type: TypeAction[action.type],
    });
  }
}
