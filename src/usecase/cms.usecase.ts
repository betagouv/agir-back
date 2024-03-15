import { Injectable } from '@nestjs/common';
import { CMSWebhookAPI } from '../infrastructure/api/types/cms/CMSWebhookAPI';
import { Thematique } from '../domain/contenu/thematique';
import { CMSThematiqueAPI } from '../infrastructure/api/types/cms/CMSThematiqueAPI';
import { CMSEvent } from '../infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../infrastructure/api/types/cms/CMSModels';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import {
  CMSWebhookEntryAPI,
  CMSWebhookPopulateAPI,
  CMSWebhookRubriqueAPI,
} from '../../src/infrastructure/api/types/cms/CMSWebhookEntryAPI';
import { Article, ArticleData } from '../domain/contenu/article';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { Quizz, QuizzData } from '../domain/contenu/quizz';
import axios from 'axios';
import { Aide } from '../../src/domain/aides/aide';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';

@Injectable()
export class CMSUsecase {
  constructor(
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private thematiqueRepository: ThematiqueRepository,
    private aideRepository: AideRepository,
  ) {}

  async manageIncomingCMSData(cmsWebhookAPI: CMSWebhookAPI) {
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
          return this.deleteArticleOrQuizz(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteArticleOrQuizz(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateArticleOrQuizz(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateArticleOrQuizz(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel.aide) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteAide(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteAide(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateAide(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateAide(cmsWebhookAPI);
      }
    }
  }

  async deleteAide(cmsWebhookAPI: CMSWebhookAPI) {
    await this.aideRepository.delete(cmsWebhookAPI.entry.id.toString());
  }

  async createOrUpdateAide(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.aideRepository.upsert(
      CMSUsecase.buildAideFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async loadArticlesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_articles: ArticleData[] = [];
    const CMS_ARTICLE_DATA = await this.loadDataFromCMS('articles');

    for (let index = 0; index < CMS_ARTICLE_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_ARTICLE_DATA[index];
      let article: ArticleData;
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

  async loadAidesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_aides: Aide[] = [];
    const CMS_AIDE_DATA = await this.loadDataFromCMS('aides');

    for (let index = 0; index < CMS_AIDE_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_AIDE_DATA[index];
      let aide: Aide;
      try {
        aide = CMSUsecase.buildAideFromCMSPopulateData(element);
        liste_aides.push(aide);
        loading_result.push(`loaded aide : ${aide.content_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load article ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste_aides.length; index++) {
      await this.aideRepository.upsert(liste_aides[index]);
    }
    return loading_result;
  }

  async loadQuizzFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_quizzes: QuizzData[] = [];
    const CMS_QUIZZ_DATA = await this.loadDataFromCMS('quizzes');

    for (let index = 0; index < CMS_QUIZZ_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_QUIZZ_DATA[index];
      let quizz: QuizzData;
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
    type: 'articles' | 'quizzes' | 'aides',
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

  async deleteArticleOrQuizz(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.model === CMSModel.article) {
      await this.articleRepository.delete(cmsWebhookAPI.entry.id.toString());
    }
    if (cmsWebhookAPI.model === CMSModel.quizz) {
      await this.quizzRepository.delete(cmsWebhookAPI.entry.id.toString());
    }
  }

  async createOrUpdateArticleOrQuizz(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    if (cmsWebhookAPI.model === CMSModel.article) {
      await this.articleRepository.upsert(
        CMSUsecase.buildArticleOrQuizzFromCMSData(cmsWebhookAPI.entry),
      );
    }
    if (cmsWebhookAPI.model === CMSModel.quizz) {
      await this.quizzRepository.upsert(
        CMSUsecase.buildArticleOrQuizzFromCMSData(cmsWebhookAPI.entry),
      );
    }
  }

  static buildArticleOrQuizzFromCMSData(
    entry: CMSWebhookEntryAPI,
  ): ArticleData | QuizzData {
    return {
      content_id: entry.id.toString(),
      tags_utilisateur: [],
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
      thematique_principale: entry.thematique_gamification
        ? ThematiqueRepository.getThematiqueByCmsId(
            entry.thematique_gamification.id,
          )
        : Thematique.climat,
      thematiques: entry.thematiques
        ? entry.thematiques.map((elem) =>
            ThematiqueRepository.getThematiqueByCmsId(elem.id),
          )
        : [],
      score: 0,
      tags_rubriques: [],
    };
  }

  static buildAideFromCMSData(entry: CMSWebhookEntryAPI): Aide {
    return {
      content_id: entry.id.toString(),
      titre: entry.titre,
      codes_postaux: entry.codes_postaux
        ? entry.codes_postaux.split(',')
        : undefined,
      thematiques: entry.thematiques
        ? entry.thematiques.map((elem) =>
            ThematiqueRepository.getThematiqueByCmsId(elem.id),
          )
        : [],
      contenu: entry.description,
      is_simulateur: entry.is_simulation ? true : false,
      montant_max: entry.montantMaximum
        ? Math.round(parseFloat(entry.montantMaximum))
        : null,
      url_simulateur: entry.url_detail_front,
    };
  }

  static buildArticleOrQuizzFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): ArticleData | QuizzData {
    return {
      content_id: entry.id.toString(),
      tags_utilisateur: [],
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
      thematique_principale: entry.attributes.thematique_gamification.data
        ? ThematiqueRepository.getThematiqueByCmsId(
            entry.attributes.thematique_gamification.data.id,
          )
        : Thematique.climat,
      thematiques:
        entry.attributes.thematiques.data.length > 0
          ? entry.attributes.thematiques.data.map((elem) =>
              ThematiqueRepository.getThematiqueByCmsId(elem.id),
            )
          : [Thematique.climat],
      score: 0,
      tags_rubriques: [],
    };
  }
  static buildAideFromCMSPopulateData(entry: CMSWebhookPopulateAPI): Aide {
    return {
      content_id: entry.id.toString(),
      titre: entry.attributes.titre,
      codes_postaux: entry.attributes.codes_postaux
        ? entry.attributes.codes_postaux.split(',')
        : [],
      contenu: entry.attributes.description,
      thematiques:
        entry.attributes.thematiques.data.length > 0
          ? entry.attributes.thematiques.data.map((elem) =>
              ThematiqueRepository.getThematiqueByCmsId(elem.id),
            )
          : [Thematique.climat],
      is_simulateur: entry.attributes.is_simulation ? true : false,
      montant_max: entry.attributes.montantMaximum
        ? Math.round(parseFloat(entry.attributes.montantMaximum))
        : null,
      url_simulateur: entry.attributes.url_detail_front,
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
}
