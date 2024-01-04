import { Injectable } from '@nestjs/common';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { CMSWebhookAPI } from '../infrastructure/api/types/cms/CMSWebhookAPI';
import {
  InteractionDefinition,
  InteractionDefinitionData,
} from '../domain/interaction/interactionDefinition';
import { v4 as uuidv4 } from 'uuid';
import { InteractionType } from '../domain/interaction/interactionType';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { Interaction } from '../domain/interaction/interaction';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Thematique } from '../domain/thematique';
import { CMSThematiqueAPI } from '../infrastructure/api/types/cms/CMSThematiqueAPI';
import { CMSEvent } from '../infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../infrastructure/api/types/cms/CMSModels';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { CMSWebhookRubriqueAPI } from '../../src/infrastructure/api/types/cms/CMSWebhookEntryAPI';
import { Article } from '../../src/domain/article';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { Quizz } from '../../src/domain/quizz/quizz';

@Injectable()
export class CMSUsecase {
  constructor(
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private thematiqueRepository: ThematiqueRepository,
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async manageIncomingCMSData(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.model === CMSModel.aide) return;
    if (cmsWebhookAPI.model === CMSModel.thematique) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.publish']:
          return this.createOrUpdateThematique(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateThematique(cmsWebhookAPI);
      }
    }
    if ([CMSModel.article, CMSModel.quizz].includes(cmsWebhookAPI.model)) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteInteraction(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteInteraction(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateContentInteraction(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateContentInteraction(cmsWebhookAPI);
      }
    }
  }

  async createOrUpdateThematique(cmsWebhookAPI: CMSWebhookAPI) {
    await this.thematiqueRepository.upsertThematique(
      cmsWebhookAPI.entry.id,
      cmsWebhookAPI.entry.titre,
    );
  }

  async deleteInteraction(cmsWebhookAPI: CMSWebhookAPI) {
    await this.interactionDefinitionRepository.deleteByContentIdAndType(
      InteractionType[cmsWebhookAPI.model],
      cmsWebhookAPI.entry.id.toString(),
    );

    await this.interactionRepository.deleteByContentIdAndTypeWhenNotDone(
      InteractionType[cmsWebhookAPI.model],
      cmsWebhookAPI.entry.id.toString(),
    );
  }

  async createOrUpdateContentInteraction(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    // NEW MODEL
    if (cmsWebhookAPI.model === CMSModel.article) {
      await this.articleRepository.upsert(
        CMSUsecase.buildArticleOrQuizzFromCMSData(cmsWebhookAPI),
      );
    }
    // NEW MODEL
    if (cmsWebhookAPI.model === CMSModel.quizz) {
      await this.quizzRepository.upsert(
        CMSUsecase.buildArticleOrQuizzFromCMSData(cmsWebhookAPI),
      );
    }

    let interactionDef =
      CMSUsecase.buildInteractionDefFromCMSData(cmsWebhookAPI);

    await this.interactionDefinitionRepository.createOrUpdateBasedOnContentIdAndType(
      interactionDef,
    );

    const inter_already_deployed =
      await this.interactionRepository.doesContentIdAndTypeExists(
        InteractionType[cmsWebhookAPI.model],
        interactionDef.content_id,
      );

    if (inter_already_deployed) {
      await this.interactionRepository.updateInteractionFromDefinitionByContentIdAndType(
        interactionDef,
      );
    } else {
      const interactionToCreate =
        Interaction.newDefaultInteractionFromDefinition(interactionDef);
      const utilisateur_ids =
        await this.utilisateurRepository.listUtilisateurIds();

      const interactionListToInsert =
        this.duplicateInteractionForEachUtilisateur(
          interactionToCreate,
          utilisateur_ids,
        );

      await this.interactionRepository.insertInteractionList(
        interactionListToInsert,
      );
    }
  }

  static buildInteractionDefFromCMSData(
    cmsWebhookAPI: CMSWebhookAPI,
  ): InteractionDefinition {
    if (InteractionType[cmsWebhookAPI.model] === undefined) {
      ApplicationError.throwModelCMSInconnuError(cmsWebhookAPI.model);
    }

    const interactionDef: InteractionDefinitionData = {
      id: uuidv4(),
      content_id: cmsWebhookAPI.entry.id.toString(),
      titre: cmsWebhookAPI.entry.titre,
      soustitre: cmsWebhookAPI.entry.sousTitre,

      thematique_gamification: cmsWebhookAPI.entry.thematique_gamification
        ? CMSThematiqueAPI.getThematique(
            cmsWebhookAPI.entry.thematique_gamification,
          )
        : Thematique.climat,

      thematique_gamification_titre: cmsWebhookAPI.entry.thematique_gamification
        ? cmsWebhookAPI.entry.thematique_gamification.titre
        : '🌍 Climat',

      thematiques: cmsWebhookAPI.entry.thematiques
        ? CMSThematiqueAPI.getThematiqueList(cmsWebhookAPI.entry.thematiques)
        : [],

      tags: this.getTitresFromRubriques(cmsWebhookAPI.entry.rubriques),
      duree: cmsWebhookAPI.entry.duree,
      frequence: cmsWebhookAPI.entry.frequence,
      image_url: cmsWebhookAPI.entry.imageUrl
        ? cmsWebhookAPI.entry.imageUrl.formats.thumbnail.url
        : null,
      difficulty: cmsWebhookAPI.entry.difficulty
        ? cmsWebhookAPI.entry.difficulty
        : 1,
      points: cmsWebhookAPI.entry.points || 0,
      codes_postaux: cmsWebhookAPI.entry.codes_postaux
        ? cmsWebhookAPI.entry.codes_postaux.split(',')
        : undefined,
      type: InteractionType[cmsWebhookAPI.model],
      url: null,
      locked: false,
      raison_lock: null,
      day_period: null,
      pinned_at_position: null,
      created_at: undefined,
      updated_at: undefined,
      score: 0.5,
    };

    const rubriques = cmsWebhookAPI.entry.rubriques;
    if (rubriques) {
      const foundNoel = rubriques.find((str) => {
        const a = str.titre.indexOf('Noël') > -1;
        const b = str.titre.indexOf('noël') > -1;
        const c = str.titre.indexOf('Noel') > -1;
        const d = str.titre.indexOf('noel') > -1;
        return a || b || c || d;
      });
      if (foundNoel) {
        interactionDef.score = 0.7;
      }
    }

    return new InteractionDefinition(interactionDef);
  }

  static buildArticleOrQuizzFromCMSData(
    cmsWebhookAPI: CMSWebhookAPI,
  ): Article | Quizz {
    return {
      content_id: cmsWebhookAPI.entry.id.toString(),
      titre: cmsWebhookAPI.entry.titre,
      soustitre: cmsWebhookAPI.entry.sousTitre,
      source: cmsWebhookAPI.entry.source,
      image_url: cmsWebhookAPI.entry.imageUrl
        ? cmsWebhookAPI.entry.imageUrl.formats.thumbnail.url
        : null,
      partenaire: cmsWebhookAPI.entry.partenaire ? cmsWebhookAPI.entry.partenaire.nom : null,
      rubrique_ids: this.getIdsFromRubriques(cmsWebhookAPI.entry.rubriques),
      rubrique_labels: this.getTitresFromRubriques(
        cmsWebhookAPI.entry.rubriques,
      ),
      codes_postaux: cmsWebhookAPI.entry.codes_postaux
        ? cmsWebhookAPI.entry.codes_postaux.split(',')
        : undefined,
      duree: cmsWebhookAPI.entry.duree,
      frequence: cmsWebhookAPI.entry.frequence,
      difficulty: cmsWebhookAPI.entry.difficulty
        ? cmsWebhookAPI.entry.difficulty
        : 1,
      points: cmsWebhookAPI.entry.points ? cmsWebhookAPI.entry.points : 0,
      thematique_gamification: cmsWebhookAPI.entry.thematique_gamification
        ? CMSThematiqueAPI.getThematique(
            cmsWebhookAPI.entry.thematique_gamification,
          )
        : Thematique.climat,
      thematiques: cmsWebhookAPI.entry.thematiques
        ? CMSThematiqueAPI.getThematiqueList(cmsWebhookAPI.entry.thematiques)
        : [],
    };
  }

  private static getTitresFromRubriques(
    rubriques: CMSWebhookRubriqueAPI[],
  ): string[] {
    if (rubriques) {
      return rubriques.map((rubrique) => rubrique.titre);
    }
    return [];
  }
  private static getIdsFromRubriques(
    rubriques: CMSWebhookRubriqueAPI[],
  ): string[] {
    if (rubriques) {
      return rubriques.map((rubrique) => rubrique.id.toString());
    }
    return [];
  }
  private duplicateInteractionForEachUtilisateur(
    interaction: Interaction,
    user_ids: Record<'id', string>[],
  ): Interaction[] {
    const result = [];
    user_ids.forEach((id_object) => {
      const newInter = new Interaction(interaction);
      newInter.utilisateurId = id_object.id;
      newInter.id = uuidv4();
      result.push(newInter);
    });
    return result;
  }
}
