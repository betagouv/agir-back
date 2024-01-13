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
import {
  CMSWebhookEntryAPI,
  CMSWebhookPopulateAPI,
  CMSWebhookRubriqueAPI,
} from '../../src/infrastructure/api/types/cms/CMSWebhookEntryAPI';
import { Article } from '../../src/domain/article';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { Quizz } from '../../src/domain/quizz/quizz';
import axios from 'axios';

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

  async loadArticlesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_articles: Article[] = [];
    const CMS_ARTICLE_DATA = await this.loadDataFromCMS('articles');

    for (let index = 0; index < CMS_ARTICLE_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_ARTICLE_DATA[index];
      let article: Article;
      try {
        article = CMSUsecase.buildArticleOrQuizzFromCMSPopulateData(element);
        liste_articles.push(article);
        loading_result.push(`loaded article : ${article.content_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load article ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste_articles.length; index++) {
      await this.articleRepository.upsert(liste_articles[index]);
    }
    return loading_result;
  }

  async loadQuizzFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_quizzes: Quizz[] = [];
    const CMS_QUIZZ_DATA = await this.loadDataFromCMS('quizzes');

    for (let index = 0; index < CMS_QUIZZ_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_QUIZZ_DATA[index];
      let quizz: Quizz;
      try {
        quizz = CMSUsecase.buildArticleOrQuizzFromCMSPopulateData(element);
        liste_quizzes.push(quizz);
        loading_result.push(`loaded quizz : ${quizz.content_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load quizz ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste_quizzes.length; index++) {
      await this.quizzRepository.upsert(liste_quizzes[index]);
    }
    return loading_result;
  }

  private async loadDataFromCMS(
    type: 'articles' | 'quizzes',
  ): Promise<CMSWebhookPopulateAPI[]> {
    let response = null;
    const URL = process.env.CMS_URL.concat(
      '/',
      type,
      '?pagination[start]=0&pagination[limit]=100&populate[0]=thematiques&populate[1]=imageUrl&populate[2]=partenaire&populate[3]=thematique_gamification&populate[4]=rubriques',
    );
    response = await axios.get(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CMS_API_KEY}`,
      },
    });
    return response.data.data;
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
        CMSUsecase.buildArticleOrQuizzFromCMSData(cmsWebhookAPI.entry),
      );
    }
    // NEW MODEL
    if (cmsWebhookAPI.model === CMSModel.quizz) {
      await this.quizzRepository.upsert(
        CMSUsecase.buildArticleOrQuizzFromCMSData(cmsWebhookAPI.entry),
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
    entry: CMSWebhookEntryAPI,
  ): Article | Quizz {
    return {
      content_id: entry.id.toString(),
      titre: entry.titre,
      soustitre: entry.sousTitre,
      source: entry.source,
      image_url: entry.imageUrl ? entry.imageUrl.formats.thumbnail.url : null,
      partenaire: entry.partenaire ? entry.partenaire.nom : null,
      rubrique_ids: this.getIdsFromRubriques(entry.rubriques),
      rubrique_labels: this.getTitresFromRubriques(entry.rubriques),
      codes_postaux: entry.codes_postaux
        ? entry.codes_postaux.split(',')
        : undefined,
      duree: entry.duree,
      frequence: entry.frequence,
      difficulty: entry.difficulty ? entry.difficulty : 1,
      points: entry.points ? entry.points : 0,
      thematique_gamification: entry.thematique_gamification
        ? CMSThematiqueAPI.getThematique(entry.thematique_gamification)
        : Thematique.climat,
      thematiques: entry.thematiques
        ? CMSThematiqueAPI.getThematiqueList(entry.thematiques)
        : [],
    };
  }
  static buildArticleOrQuizzFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): Article | Quizz {
    return {
      content_id: entry.id.toString(),
      titre: entry.attributes.titre,
      soustitre: entry.attributes.sousTitre,
      source: entry.attributes.source,
      image_url: entry.attributes.imageUrl
        ? entry.attributes.imageUrl.data.attributes.formats.thumbnail.url
        : null,
      partenaire: entry.attributes.partenaire.data
        ? entry.attributes.partenaire.data.attributes.nom
        : null,
      rubrique_ids:
        entry.attributes.rubriques.data.length > 0
          ? entry.attributes.rubriques.data.map((elem) => elem.id.toString())
          : [],
      rubrique_labels:
        entry.attributes.rubriques.data.length > 0
          ? entry.attributes.rubriques.data.map((elem) => elem.attributes.titre)
          : [],
      codes_postaux: entry.attributes.codes_postaux
        ? entry.attributes.codes_postaux.split(',')
        : [],
      duree: entry.attributes.duree,
      frequence: entry.attributes.frequence,
      difficulty: entry.attributes.difficulty ? entry.attributes.difficulty : 1,
      points: entry.attributes.points ? entry.attributes.points : 0,
      thematique_gamification: entry.attributes.thematique_gamification.data
        ? CMSThematiqueAPI.getThematiqueByCmsId(
            entry.attributes.thematique_gamification.data.id,
          )
        : Thematique.climat,
      thematiques:
        entry.attributes.thematiques.data.length > 0
          ? entry.attributes.thematiques.data.map((elem) =>
              CMSThematiqueAPI.getThematiqueByCmsId(elem.id),
            )
          : [Thematique.climat],
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
    user_ids: string[],
  ): Interaction[] {
    const result = [];
    user_ids.forEach((user_id) => {
      const newInter = new Interaction(interaction);
      newInter.utilisateurId = user_id;
      newInter.id = uuidv4();
      result.push(newInter);
    });
    return result;
  }
}
