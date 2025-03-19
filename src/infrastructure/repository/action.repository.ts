import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Action } from '@prisma/client';
import {
  ActionDefinition,
  TypeCodeAction,
} from '../../domain/actions/actionDefinition';
import { TypeAction } from '../../domain/actions/typeAction';
import { CategorieRecherche } from '../../domain/bibliotheque_services/recherche/categorieRecherche';
import { TagExcluant } from '../../domain/scoring/tagExcluant';
import { Thematique } from '../../domain/thematique/thematique';
import { PrismaService } from '../prisma/prisma.service';

export type ActionFilter = {
  thematique?: Thematique;
  liste_thematiques?: Thematique[];
  type_codes_exclus?: TypeCodeAction[];
  type_codes_inclus?: TypeCodeAction[];
  codes_exclus?: string[];
  codes_inclus?: string[];
  titre_fragment?: string;
};

@Injectable()
export class ActionRepository {
  constructor(private prisma: PrismaService) {
    ActionRepository.catalogue = new Map();
  }

  private static catalogue: Map<string, ActionDefinition>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading Action definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadCache(): Promise<void> {
    const new_map: Map<string, ActionDefinition> = new Map();

    const liste = await this.prisma.action.findMany();
    for (const action_db of liste) {
      new_map.set(
        action_db.type_code_id,
        this.buildActionDefinitionFromDB(action_db),
      );
    }
    ActionRepository.catalogue = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    ActionRepository.catalogue = new Map();
  }

  public getActionDefinitionByTypeCode(
    type_code: TypeCodeAction,
  ): ActionDefinition {
    return ActionRepository.catalogue.get(
      ActionDefinition.getIdFromTypeCode(type_code),
    );
  }

  public getActionCompleteList(): ActionDefinition[] {
    return Array.from(ActionRepository.catalogue.values());
  }

  async upsert(action: ActionDefinition): Promise<void> {
    const action_db: Action = {
      cms_id: action.cms_id,
      code: action.code,
      titre: action.titre,
      consigne: action.consigne,
      label_compteur: action.label_compteur,
      quizz_felicitations: action.quizz_felicitations,
      thematique: action.thematique,
      besoins: action.besoins,
      comment: action.comment,
      kyc_codes: action.kyc_codes,
      lvo_action: action.lvo_action,
      lvo_objet: action.lvo_objet,
      pourquoi: action.pourquoi,
      quizz_ids: action.quizz_ids,
      faq_ids: action.faq_ids,
      recette_categorie: action.recette_categorie,
      sous_titre: action.sous_titre,
      type: action.type,
      type_code_id: action.getTypeCodeId(),
      tags_excluants: action.tags_excluants,
      sources: action.sources as any,
      pdcn_categorie: action.pdcn_categorie,

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
    const main_filter = [];

    if (filtre.thematique) {
      main_filter.push({ thematique: filtre.thematique });
    }
    if (filtre.liste_thematiques) {
      main_filter.push({
        thematique: {
          in: filtre.liste_thematiques,
        },
      });
    }
    if (filtre.titre_fragment) {
      main_filter.push({
        titre: {
          contains: filtre.titre_fragment,
          mode: 'insensitive',
        },
      });
    }

    if (filtre.codes_exclus) {
      main_filter.push({
        code: {
          notIn: filtre.codes_exclus,
        },
      });
    }
    if (filtre.codes_inclus) {
      main_filter.push({
        code: {
          in: filtre.codes_inclus,
        },
      });
    }
    if (filtre.type_codes_inclus) {
      main_filter.push({
        type_code_id: {
          in: filtre.type_codes_inclus.map((t) =>
            ActionDefinition.getIdFromTypeCode(t),
          ),
        },
      });
    }
    if (filtre.type_codes_exclus) {
      main_filter.push({
        type_code_id: {
          notIn: filtre.type_codes_exclus.map((t) =>
            ActionDefinition.getIdFromTypeCode(t),
          ),
        },
      });
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
      kyc_codes: action.kyc_codes,
      lvo_action: CategorieRecherche[action.lvo_action],
      lvo_objet: action.lvo_objet,
      quizz_ids: action.quizz_ids,
      recette_categorie: CategorieRecherche[action.recette_categorie],
      pdcn_categorie: CategorieRecherche[action.pdcn_categorie],
      sous_titre: action.sous_titre,
      type: TypeAction[action.type],
      quizz_felicitations: action.quizz_felicitations,
      tags_excluants: action.tags_excluants.map((t) => TagExcluant[t]),
      faq_ids: action.faq_ids,
      consigne: action.consigne,
      label_compteur: action.label_compteur,
      sources: action.sources as any,
    });
  }
}
