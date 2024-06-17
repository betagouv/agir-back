import { Injectable } from '@nestjs/common';
import { CMSWebhookAPI } from '../infrastructure/api/types/cms/CMSWebhookAPI';
import { Thematique } from '../domain/contenu/thematique';
import { CMSEvent } from '../infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../infrastructure/api/types/cms/CMSModels';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import {
  CMSWebhookEntryAPI,
  CMSWebhookPopulateAPI,
  CMSWebhookRubriqueAPI,
} from '../../src/infrastructure/api/types/cms/CMSWebhookEntryAPI';
import { ArticleData } from '../domain/contenu/article';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { QuizzData } from '../domain/contenu/quizz';
import axios from 'axios';
import { Aide } from '../../src/domain/aides/aide';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { DefiDefinition } from '../../src/domain/defis/defiDefinition';
import { TagUtilisateur } from '../../src/domain/scoring/tagUtilisateur';
import { Besoin } from '../../src/domain/aides/besoin';
import { App } from '../../src/domain/app';
import {
  MissionDefinition,
  ObjectifDefinition,
} from '../../src/domain/mission/missionDefinition';
import { ContentType } from '../../src/domain/contenu/contentType';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { KycDefinition } from '../../src/domain/kyc/kycDefinition';
import { TypeReponseQuestionKYC } from '../../src/domain/kyc/questionQYC';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { Categorie } from '../../src/domain/contenu/categorie';
import { TuileUnivers } from 'src/domain/univers/tuileUnivers';
import { UniversDefinition } from 'src/domain/univers/universDefinition';
import { ThematiqueDefinition } from 'src/domain/univers/thematiqueDefinition';

@Injectable()
export class CMSUsecase {
  constructor(
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private thematiqueRepository: ThematiqueRepository,
    private aideRepository: AideRepository,
    private defiRepository: DefiRepository,
    private missionRepository: MissionRepository,
    private kycRepository: KycRepository,
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
    if (cmsWebhookAPI.model === CMSModel.univers) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.publish']:
          return this.createOrUpdateUnivers(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateUnivers(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel.kyc) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteKyc(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteKyc(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateKyc(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateKyc(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel.mission) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteMission(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteMission(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateMission(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateMission(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel['thematique-univers']) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.publish']:
          return this.createOrUpdateThematiqueUnivers(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateThematiqueUnivers(cmsWebhookAPI);
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
    if (cmsWebhookAPI.model === CMSModel.defi) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteDefi(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteDefi(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateDefi(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateDefi(cmsWebhookAPI);
      }
    }
  }

  async deleteAide(cmsWebhookAPI: CMSWebhookAPI) {
    await this.aideRepository.delete(cmsWebhookAPI.entry.id.toString());
  }
  async deleteDefi(cmsWebhookAPI: CMSWebhookAPI) {
    await this.defiRepository.delete(cmsWebhookAPI.entry.id.toString());
  }

  async createOrUpdateAide(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.aideRepository.upsert(
      CMSUsecase.buildAideFromCMSData(cmsWebhookAPI.entry),
    );
  }
  async createOrUpdateDefi(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.defiRepository.upsert(
      CMSUsecase.buildDefiFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async loadUniversFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_univers: UniversDefinition[] = [];
    const CMS_UNIVERS_DATA = await this.loadDataFromCMS('universes');

    for (let index = 0; index < CMS_UNIVERS_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_UNIVERS_DATA[index];
      let univers: UniversDefinition;
      try {
        univers = CMSUsecase.buildUniversFromCMSPopulateData(element);
        liste_univers.push(univers);
        loading_result.push(`loaded univers : ${univers.code}`);
      } catch (error) {
        loading_result.push(
          `Could not load univers ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (const univers_to_upsert of liste_univers) {
      await this.thematiqueRepository.upsertUnivers(univers_to_upsert);
    }
    return loading_result;
  }

  async loadThematiquesUniversFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_them: ThematiqueDefinition[] = [];
    const CMS_THEMATIQUE_DATA = await this.loadDataFromCMS(
      'thematiques-univers',
    );

    for (const element of CMS_THEMATIQUE_DATA) {
      let thematique: ThematiqueDefinition;
      try {
        thematique =
          CMSUsecase.buildThematiqueUniversFromCMSPopulateData(element);
        liste_them.push(thematique);
        loading_result.push(`loaded thematiqueUnivers : ${thematique.code}`);
      } catch (error) {
        loading_result.push(
          `Could not load thematiqueUnivers ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (const them_to_upsert of liste_them) {
      await this.thematiqueRepository.upsertThematiqueUnivers(them_to_upsert);
    }
    return loading_result;
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

  async loadDefisFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_defis: DefiDefinition[] = [];
    const CMS_DEFI_DATA = await this.loadDataFromCMS('defis');

    for (let index = 0; index < CMS_DEFI_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_DEFI_DATA[index];
      let defi: DefiDefinition;
      try {
        defi = CMSUsecase.buildDefiFromCMSPopulateData(element);
        liste_defis.push(defi);
        loading_result.push(`loaded article : ${defi.content_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load article ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste_defis.length; index++) {
      await this.defiRepository.upsert(liste_defis[index]);
    }
    return loading_result;
  }

  async loadKYCFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_kyc: KycDefinition[] = [];
    const CMS_KYC_DATA = await this.loadDataFromCMS('kycs');

    for (let index = 0; index < CMS_KYC_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_KYC_DATA[index];
      let kyc: KycDefinition;
      try {
        kyc = CMSUsecase.buildKYCFromCMSPopulateData(element);
        liste_kyc.push(kyc);
        loading_result.push(`loaded kyc : ${kyc.id_cms}`);
      } catch (error) {
        loading_result.push(
          `Could not load kyc ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste_kyc.length; index++) {
      await this.kycRepository.upsert(liste_kyc[index]);
    }
    return loading_result;
  }

  async loadMissionsFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_missionsDef: MissionDefinition[] = [];
    const CMS_MISSION_DATA = await this.loadDataFromCMS('missions');

    for (let index = 0; index < CMS_MISSION_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_MISSION_DATA[index];
      let mission_def: MissionDefinition;
      try {
        mission_def = CMSUsecase.buildMissionFromCMSPopulateData(element);
        liste_missionsDef.push(mission_def);
        loading_result.push(`loaded missions : ${mission_def.id_cms}`);
      } catch (error) {
        loading_result.push(
          `Could not load mission ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste_missionsDef.length; index++) {
      await this.missionRepository.upsert(liste_missionsDef[index]);
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
    type:
      | 'articles'
      | 'quizzes'
      | 'aides'
      | 'defis'
      | 'kycs'
      | 'missions'
      | 'universes'
      | 'thematiques-univers',
  ): Promise<CMSWebhookPopulateAPI[]> {
    let response = null;
    const URL = App.getCmsURL().concat(
      '/',
      type,
      '?pagination[start]=0&pagination[limit]=100&populate[0]=thematiques&populate[1]=imageUrl&populate[2]=partenaire&populate[3]=thematique_gamification&populate[4]=rubriques&populate[5]=thematique&populate[6]=tags&populate[7]=besoin&populate[8]=univers&populate[9]=thematique_univers&populate[10]=prochaines_thematiques&populate[11]=objectifs&populate[12]=thematique_univers_unique&populate[13]=objectifs.article&populate[14]=objectifs.quizz&populate[15]=objectifs.defi&populate[16]=objectifs.kyc&populate[17]=reponses&populate[18]=OR_Conditions&populate[19]=OR_Conditions.AND_Conditions&populate[20]=OR_Conditions.AND_Conditions.kyc&populate[21]=famille&populate[22]=univers_parent',
    );
    response = await axios.get(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${App.getCmsApiKey()}`,
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

  async createOrUpdateUnivers(cmsWebhookAPI: CMSWebhookAPI) {
    await this.thematiqueRepository.upsertUnivers({
      code: cmsWebhookAPI.entry.code,
      label: cmsWebhookAPI.entry.label,
      id_cms: cmsWebhookAPI.entry.id,
      image_url: this.getImageUrl(cmsWebhookAPI),
      is_locked: cmsWebhookAPI.entry.is_locked,
    });
  }

  async createOrUpdateKyc(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.kycRepository.upsert(
      CMSUsecase.buildKycFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async createOrUpdateMission(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.missionRepository.upsert(
      CMSUsecase.buildMissionFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async deleteKyc(cmsWebhookAPI: CMSWebhookAPI) {
    await this.kycRepository.delete(cmsWebhookAPI.entry.id);
  }
  async deleteMission(cmsWebhookAPI: CMSWebhookAPI) {
    await this.missionRepository.delete(cmsWebhookAPI.entry.id);
  }

  async createOrUpdateThematiqueUnivers(cmsWebhookAPI: CMSWebhookAPI) {
    await this.thematiqueRepository.upsertThematiqueUnivers({
      code: cmsWebhookAPI.entry.code,
      univers_parent: cmsWebhookAPI.entry.univers_parent
        ? cmsWebhookAPI.entry.univers_parent.code
        : undefined,
      id_cms: cmsWebhookAPI.entry.id,
      label: cmsWebhookAPI.entry.label,
      niveau: cmsWebhookAPI.entry.niveau,
      image_url: this.getImageUrl(cmsWebhookAPI),
      famille_ordre: cmsWebhookAPI.entry.famille
        ? cmsWebhookAPI.entry.famille.ordre
        : 999,
      famille_id_cms: cmsWebhookAPI.entry.famille
        ? cmsWebhookAPI.entry.famille.id
        : -1,
    });
  }

  private static getImageUrlFromPopulate(
    cmsPopulateAPI: CMSWebhookPopulateAPI,
  ) {
    let url = null;
    if (cmsPopulateAPI.attributes.imageUrl) {
      if (
        cmsPopulateAPI.attributes.imageUrl.data.attributes.formats.thumbnail
      ) {
        url =
          cmsPopulateAPI.attributes.imageUrl.data.attributes.formats.thumbnail
            .url;
      } else {
        url = cmsPopulateAPI.attributes.imageUrl.data.attributes.url;
      }
    }
    return url;
  }
  private getImageUrl(cmsWebhookAPI: CMSWebhookAPI) {
    let url = null;
    if (cmsWebhookAPI.entry.imageUrl) {
      if (cmsWebhookAPI.entry.imageUrl.formats.thumbnail) {
        url = cmsWebhookAPI.entry.imageUrl.formats.thumbnail.url;
      } else {
        url = cmsWebhookAPI.entry.imageUrl.url;
      }
    }
    return url;
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
      codes_postaux: CMSUsecase.split(entry.codes_postaux),
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
      categorie: Categorie[entry.categorie],
      mois: entry.mois ? entry.mois.split(',').map((m) => parseInt(m)) : [],
    };
  }

  static buildAideFromCMSData(entry: CMSWebhookEntryAPI): Aide {
    return {
      content_id: entry.id.toString(),
      titre: entry.titre,
      codes_postaux: CMSUsecase.split(entry.codes_postaux),
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
      besoin: entry.besoin ? Besoin[entry.besoin.code] : null,
      besoin_desc: entry.besoin ? entry.besoin.description : null,
      include_codes_commune: CMSUsecase.split(entry.include_codes_commune),
      exclude_codes_commune: CMSUsecase.split(entry.exclude_codes_commune),
      codes_departement: CMSUsecase.split(entry.codes_departement),
      codes_region: CMSUsecase.split(entry.codes_region),
    };
  }

  static buildDefiFromCMSData(entry: CMSWebhookEntryAPI): DefiDefinition {
    return {
      content_id: entry.id.toString(),
      titre: entry.titre,
      thematique: entry.thematique
        ? ThematiqueRepository.getThematiqueByCmsId(entry.thematique.id)
        : Thematique.climat,
      astuces: entry.astuces,
      points: entry.points,
      pourquoi: entry.pourquoi,
      sous_titre: entry.sousTitre,
      tags: entry.tags
        ? entry.tags.map((elem) => TagUtilisateur[elem.code])
        : [],
      universes: entry.univers ? entry.univers.map((u) => u.code) : [],
      thematiques_univers: entry.thematique_univers
        ? entry.thematique_univers.map((u) => u.code)
        : [],
      categorie: Categorie[entry.categorie],
      mois: entry.mois ? entry.mois.split(',').map((m) => parseInt(m)) : [],
      conditions: entry.OR_Conditions.map((or) =>
        or.AND_Conditions.map((and) => ({
          code_kyc: and.kyc.code,
          id_kyc: and.kyc.id.toString(),
          code_reponse: and.code_reponse,
        })),
      ),
    };
  }
  static buildKycFromCMSData(entry: CMSWebhookEntryAPI): KycDefinition {
    return {
      id_cms: entry.id,
      code: entry.code,
      categorie: Categorie[entry.categorie],
      type: TypeReponseQuestionKYC[entry.type],
      is_ngc: entry.is_ngc,
      points: entry.points,
      question: entry.question,
      thematique: entry.thematique
        ? ThematiqueRepository.getThematiqueByCmsId(entry.thematique.id)
        : Thematique.climat,
      reponses: entry.reponses
        ? entry.reponses.map((r) => ({
            label: r.reponse,
            code: r.code,
          }))
        : [],
      tags: entry.tags
        ? entry.tags.map((elem) => TagUtilisateur[elem.code])
        : [],
      universes: entry.univers ? entry.univers.map((u) => u.code) : [],
    };
  }

  static buildMissionFromCMSData(entry: CMSWebhookEntryAPI): MissionDefinition {
    return {
      id_cms: entry.id,
      est_visible: entry.est_visible,
      prochaines_thematiques:
        entry.prochaines_thematiques.length > 0
          ? entry.prochaines_thematiques.map((t) => t.code)
          : [],
      thematique_univers: entry.thematique_univers_unique.code,
      objectifs:
        entry.objectifs.length > 0
          ? entry.objectifs.map((obj) => {
              const result = new ObjectifDefinition({
                titre: obj.titre,
                content_id: null,
                points: obj.points,
                type: null,
              });
              if (obj.article) {
                result.type = ContentType.article;
                result.content_id = obj.article.id.toString();
              }
              if (obj.defi) {
                result.type = ContentType.defi;
                result.content_id = obj.defi.id.toString();
              }
              if (obj.quizz) {
                result.type = ContentType.quizz;
                result.content_id = obj.quizz.id.toString();
              }
              if (obj.kyc) {
                result.type = ContentType.kyc;
                result.content_id = obj.kyc.code;
              }
              return result;
            })
          : [],
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
      codes_postaux: CMSUsecase.split(entry.attributes.codes_postaux),
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
      categorie: Categorie[entry.attributes.categorie],
      mois: entry.attributes.mois
        ? entry.attributes.mois.split(',').map((m) => parseInt(m))
        : [],
    };
  }
  static buildAideFromCMSPopulateData(entry: CMSWebhookPopulateAPI): Aide {
    return {
      content_id: entry.id.toString(),
      titre: entry.attributes.titre,
      codes_postaux: CMSUsecase.split(entry.attributes.codes_postaux),
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
      besoin: entry.attributes.besoin.data
        ? Besoin[entry.attributes.besoin.data.attributes.code]
        : null,
      besoin_desc: entry.attributes.besoin.data
        ? entry.attributes.besoin.data.attributes.description
        : null,
      include_codes_commune: CMSUsecase.split(
        entry.attributes.include_codes_commune,
      ),
      exclude_codes_commune: CMSUsecase.split(
        entry.attributes.exclude_codes_commune,
      ),
      codes_departement: CMSUsecase.split(entry.attributes.codes_departement),
      codes_region: CMSUsecase.split(entry.attributes.codes_region),
    };
  }

  static buildUniversFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): UniversDefinition {
    return {
      id_cms: entry.id,
      label: entry.attributes.label,
      image_url: this.getImageUrlFromPopulate(entry),
      is_locked: entry.attributes.is_locked,
      code: entry.attributes.code,
    };
  }

  static buildThematiqueUniversFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): ThematiqueDefinition {
    return {
      id_cms: entry.id,
      label: entry.attributes.label,
      image_url: this.getImageUrlFromPopulate(entry),
      code: entry.attributes.code,
      niveau: entry.attributes.niveau,
      univers_parent: entry.attributes.univers_parent.data.attributes.code,
      famille_ordre: entry.attributes.famille.data
        ? entry.attributes.famille.data.attributes.ordre
        : 999,
      famille_id_cms: entry.attributes.famille.data
        ? entry.attributes.famille.data.id
        : -1,
    };
  }

  static buildDefiFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): DefiDefinition {
    return {
      content_id: entry.id.toString(),
      titre: entry.attributes.titre,
      sous_titre: entry.attributes.sousTitre,
      astuces: entry.attributes.astuces,
      pourquoi: entry.attributes.pourquoi,
      points: entry.attributes.points,
      thematique: entry.attributes.thematique.data
        ? ThematiqueRepository.getThematiqueByCmsId(
            entry.attributes.thematique.data.id,
          )
        : Thematique.climat,
      tags: entry.attributes.tags.data.map(
        (elem) => TagUtilisateur[elem.attributes.code],
      ),
      universes:
        entry.attributes.univers.data.length > 0
          ? entry.attributes.univers.data.map((u) => u.attributes.code)
          : [],
      thematiques_univers:
        entry.attributes.thematique_univers.data.length > 0
          ? entry.attributes.thematique_univers.data.map(
              (t) => t.attributes.code,
            )
          : [],
      categorie: Categorie[entry.attributes.categorie],
      mois: entry.attributes.mois
        ? entry.attributes.mois.split(',').map((m) => parseInt(m))
        : [],
      conditions: entry.attributes.OR_Conditions.map((or) =>
        or.AND_Conditions.map((and) => ({
          id_kyc: and.kyc.data.id,
          code_kyc: and.kyc.data.attributes.code,
          code_reponse: and.code_reponse,
        })),
      ),
    };
  }

  static buildKYCFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): KycDefinition {
    return {
      id_cms: entry.id,
      code: entry.attributes.code,
      type: TypeReponseQuestionKYC[entry.attributes.type],
      categorie: Categorie[entry.attributes.categorie],
      points: entry.attributes.points,
      is_ngc: entry.attributes.is_ngc,
      question: entry.attributes.question,
      reponses: entry.attributes.reponses
        ? entry.attributes.reponses.map((r) => ({
            label: r.reponse,
            code: r.reponse,
          }))
        : [],
      thematique: entry.attributes.thematique.data
        ? ThematiqueRepository.getThematiqueByCmsId(
            entry.attributes.thematique.data.id,
          )
        : Thematique.climat,
      tags: entry.attributes.tags.data.map(
        (elem) => TagUtilisateur[elem.attributes.code],
      ),
      universes:
        entry.attributes.univers.data.length > 0
          ? entry.attributes.univers.data.map((u) => u.attributes.code)
          : [],
    };
  }

  static buildMissionFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): MissionDefinition {
    return {
      id_cms: entry.id,
      est_visible: entry.attributes.est_visible,
      prochaines_thematiques:
        entry.attributes.prochaines_thematiques.data.length > 0
          ? entry.attributes.prochaines_thematiques.data.map(
              (t) => t.attributes.code,
            )
          : [],
      thematique_univers: entry.attributes.thematique_univers_unique.data
        ? entry.attributes.thematique_univers_unique.data.attributes.code
        : null,
      objectifs:
        entry.attributes.objectifs.length > 0
          ? entry.attributes.objectifs.map((obj) => {
              const result = new ObjectifDefinition({
                titre: obj.titre,
                content_id: null,
                points: obj.points,
                type: null,
              });
              if (obj.article.data) {
                result.type = ContentType.article;
                result.content_id = obj.article.data.id.toString();
              }
              if (obj.defi.data) {
                result.type = ContentType.defi;
                result.content_id = obj.defi.data.id.toString();
              }
              if (obj.quizz.data) {
                result.type = ContentType.quizz;
                result.content_id = obj.quizz.data.id.toString();
              }
              if (obj.kyc.data) {
                result.type = ContentType.kyc;
                result.content_id = obj.kyc.data.attributes.code;
              }
              return result;
            })
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

  private static split(list: string) {
    return list ? list.split(',').map((c) => c.trim()) : [];
  }
}
