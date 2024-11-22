import { Injectable } from '@nestjs/common';
import { Thematique } from '../domain/contenu/thematique';
import { CMSModel } from '../infrastructure/api/types/cms/CMSModels';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { ArticleData } from '../domain/contenu/article';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { QuizzData } from '../domain/contenu/quizz';
import axios from 'axios';
import { AideDefinition } from '../domain/aides/aideDefinition';
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
import { TypeReponseQuestionKYC, Unite } from '../domain/kyc/questionKYC';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { Categorie } from '../../src/domain/contenu/categorie';
import { ThematiqueDefinition } from 'src/domain/thematique/thematiqueDefinition';
import { CMSWebhookPopulateAPI } from '../infrastructure/api/types/cms/CMSWebhookPopulateAPI';

@Injectable()
export class CMSImportUsecase {
  constructor(
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private thematiqueRepository: ThematiqueRepository,
    private aideRepository: AideRepository,
    private defiRepository: DefiRepository,
    private missionRepository: MissionRepository,
    private kycRepository: KycRepository,
  ) {}

  async loadArticlesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_articles: ArticleData[] = [];
    const CMS_ARTICLE_DATA = await this.loadDataFromCMS('articles');

    for (let index = 0; index < CMS_ARTICLE_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_ARTICLE_DATA[index];
      let article: ArticleData;
      try {
        article = this.buildArticleOrQuizzFromCMSPopulateData(
          element,
          CMSModel.article,
        ) as ArticleData;
        liste_articles.push(article);
        loading_result.push(`loaded article : ${article.content_id}`);
      } catch (error) {
        console.log(error);
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
        defi = this.buildDefiFromCMSPopulateData(element);
        liste_defis.push(defi);
        loading_result.push(`loaded defi : ${defi.content_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load defi ${element.id} : ${error.message}`,
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
        kyc = this.buildKYCFromCMSPopulateData(element);
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
        mission_def = this.buildMissionFromCMSPopulateData(element);
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

  async loadThematiquesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_themDef: ThematiqueDefinition[] = [];
    const CMS_THEMATIQUE_DATA = await this.loadDataFromCMS('thematiques');

    for (let index = 0; index < CMS_THEMATIQUE_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_THEMATIQUE_DATA[index];
      let them_def: ThematiqueDefinition;
      try {
        them_def = this.buildThematiqueFromCMSPopulateData(element);
        liste_themDef.push(them_def);
        loading_result.push(
          `loaded thematique : ${them_def.id_cms}/${them_def.code}`,
        );
      } catch (error) {
        loading_result.push(
          `Could not load thematique ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (const them_def of liste_themDef) {
      await this.thematiqueRepository.upsert(them_def);
    }
    return loading_result;
  }

  async loadAidesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_aides: AideDefinition[] = [];
    const CMS_AIDE_DATA = await this.loadDataFromCMS('aides');

    for (let index = 0; index < CMS_AIDE_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_AIDE_DATA[index];
      let aide: AideDefinition;
      try {
        aide = this.buildAideFromCMSPopulateData(element);
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
        quizz = this.buildArticleOrQuizzFromCMSPopulateData(
          element,
          CMSModel.quizz,
        );
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
      | 'thematiques',
  ): Promise<CMSWebhookPopulateAPI[]> {
    let result = [];
    const page_1 = '&pagination[start]=0&pagination[limit]=100';
    const page_2 = '&pagination[start]=100&pagination[limit]=100';
    const page_3 = '&pagination[start]=200&pagination[limit]=100';
    const page_4 = '&pagination[start]=300&pagination[limit]=100';
    const page_5 = '&pagination[start]=400&pagination[limit]=100';
    const page_6 = '&pagination[start]=500&pagination[limit]=100';
    let response = null;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${App.getCmsApiKey()}`,
    };

    let URL = this.buildPopulateURL(page_1, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_2, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_3, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_4, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_5, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_6, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    return result;
  }

  private buildPopulateURL(page: string, type: string) {
    const URL = App.getCmsURL().concat(
      '/',
      type,
      '?populate[0]=thematiques&populate[1]=imageUrl&populate[2]=partenaire&populate[3]=thematique_gamification&populate[4]=rubriques&populate[5]=thematique&populate[6]=tags&populate[7]=besoin&populate[8]=univers&populate[9]=thematique_univers&populate[11]=objectifs&populate[12]=thematique_univers_unique&populate[13]=objectifs.article&populate[14]=objectifs.quizz&populate[15]=objectifs.defi&populate[16]=objectifs.kyc&populate[17]=reponses&populate[18]=OR_Conditions&populate[19]=OR_Conditions.AND_Conditions&populate[20]=OR_Conditions.AND_Conditions.kyc&populate[21]=famille&populate[22]=univers_parent&populate[23]=tag_article&populate[24]=objectifs.tag_article&populate[25]=objectifs.mosaic',
    );
    return URL.concat(page);
  }

  private getImageUrlFromPopulate(cmsPopulateAPI: CMSWebhookPopulateAPI) {
    let url = null;
    if (cmsPopulateAPI.attributes.imageUrl) {
      if (cmsPopulateAPI.attributes.imageUrl.data) {
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
    }
    return url;
  }

  private extractUnite(label_unite: string) {
    if (!label_unite) return null;
    const unite = Unite[label_unite.substring(0, label_unite.indexOf(' '))];
    return unite ? unite : null;
  }

  private buildArticleOrQuizzFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
    type: CMSModel,
  ): ArticleData | QuizzData {
    const result = {
      content_id: entry.id.toString(),
      tags_utilisateur: [],
      titre: entry.attributes.titre,
      soustitre: entry.attributes.sousTitre,
      source: entry.attributes.source,
      image_url: this.getImageUrlFromPopulate(entry),
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
      codes_postaux: CMSImportUsecase.split(entry.attributes.codes_postaux),
      duree: entry.attributes.duree,
      frequence: entry.attributes.frequence,
      difficulty: entry.attributes.difficulty ? entry.attributes.difficulty : 1,
      points: entry.attributes.points ? entry.attributes.points : 0,
      thematique_principale: entry.attributes.thematique_gamification.data
        ? Thematique[
            entry.attributes.thematique_gamification.data.attributes.code
          ]
        : Thematique.climat,
      thematiques:
        entry.attributes.thematiques.data.length > 0
          ? entry.attributes.thematiques.data.map(
              (elem) => Thematique[elem.attributes.code],
            )
          : [Thematique.climat],
      score: 0,
      tags_rubriques: [],
      categorie: Categorie[entry.attributes.categorie],
      mois: entry.attributes.mois
        ? entry.attributes.mois.split(',').map((m) => parseInt(m))
        : [],
    };
    if (type === CMSModel.article) {
      Object.assign(result, {
        include_codes_commune: CMSImportUsecase.split(
          entry.attributes.include_codes_commune,
        ),
        exclude_codes_commune: CMSImportUsecase.split(
          entry.attributes.exclude_codes_commune,
        ),
        codes_departement: CMSImportUsecase.split(
          entry.attributes.codes_departement,
        ),
        codes_region: CMSImportUsecase.split(entry.attributes.codes_region),
        tag_article: entry.attributes.tag_article.data
          ? entry.attributes.tag_article.data.attributes.code
          : undefined,
      });
    }
    return result;
  }
  private buildAideFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): AideDefinition {
    return {
      content_id: entry.id.toString(),
      titre: entry.attributes.titre,
      codes_postaux: CMSImportUsecase.split(entry.attributes.codes_postaux),
      contenu: entry.attributes.description,
      thematiques:
        entry.attributes.thematiques.data.length > 0
          ? entry.attributes.thematiques.data.map(
              (elem) => Thematique[elem.attributes.code],
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
      include_codes_commune: CMSImportUsecase.split(
        entry.attributes.include_codes_commune,
      ),
      exclude_codes_commune: CMSImportUsecase.split(
        entry.attributes.exclude_codes_commune,
      ),
      codes_departement: CMSImportUsecase.split(
        entry.attributes.codes_departement,
      ),
      codes_region: CMSImportUsecase.split(entry.attributes.codes_region),
      echelle: entry.attributes.echelle,
      url_source: entry.attributes.url_source,
      url_demande: entry.attributes.url_demande,
    };
  }

  private buildThematiqueFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): ThematiqueDefinition {
    return {
      id_cms: entry.id,
      label: entry.attributes.label,
      image_url: this.getImageUrlFromPopulate(entry),
      code: entry.attributes.code,
      emoji: entry.attributes.emoji,
      titre: entry.attributes.titre,
    };
  }

  private buildDefiFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): DefiDefinition {
    return {
      content_id: entry.id.toString(),
      titre: entry.attributes.titre,
      sous_titre: entry.attributes.sousTitre,
      astuces: entry.attributes.astuces,
      pourquoi: entry.attributes.pourquoi,
      points: entry.attributes.points,
      impact_kg_co2: entry.attributes.impact_kg_co2,
      thematique: entry.attributes.thematique.data
        ? Thematique[entry.attributes.thematique.data.attributes.code]
        : Thematique.climat,
      tags: entry.attributes.tags.data.map(
        (elem) =>
          TagUtilisateur[elem.attributes.code] || TagUtilisateur.UNKNOWN,
      ),
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

  private buildKYCFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): KycDefinition {
    return {
      id_cms: entry.id,
      code: entry.attributes.code,
      type: TypeReponseQuestionKYC[entry.attributes.type],
      categorie: Categorie[entry.attributes.categorie],
      emoji: entry.attributes.emoji,
      points: entry.attributes.points,
      unite: this.extractUnite(entry.attributes.unite),
      is_ngc: entry.attributes.is_ngc,
      a_supprimer: !!entry.attributes.A_SUPPRIMER,
      ngc_key: entry.attributes.ngc_key,
      question: entry.attributes.question,
      reponses: entry.attributes.reponses
        ? entry.attributes.reponses.map((r) => ({
            label: r.reponse,
            code: r.code,
            ngc_code: r.ngc_code,
            value: r.reponse,
          }))
        : [],
      thematique: entry.attributes.thematique.data
        ? Thematique[entry.attributes.thematique.data.attributes.code]
        : Thematique.climat,
      tags: entry.attributes.tags.data.map(
        (elem) =>
          TagUtilisateur[elem.attributes.code] || TagUtilisateur.UNKNOWN,
      ),
      short_question: entry.attributes.short_question,
      image_url: this.getImageUrlFromPopulate(entry),
      conditions: entry.attributes.OR_Conditions
        ? entry.attributes.OR_Conditions.map((or) =>
            or.AND_Conditions.map((and) => ({
              id_kyc: and.kyc.data.id,
              code_kyc: and.kyc.data.attributes.code,
              code_reponse: and.code_reponse,
            })),
          )
        : [],
    };
  }

  private buildMissionFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): MissionDefinition {
    return {
      id_cms: entry.id,
      est_visible: entry.attributes.est_visible,
      thematique: entry.attributes.thematique.data
        ? Thematique[entry.attributes.thematique.data.attributes.code]
        : Thematique.climat,
      code: entry.attributes.code,
      is_first: entry.attributes.is_first,
      titre: entry.attributes.titre,
      introduction: entry.attributes.introduction,
      image_url: this.getImageUrlFromPopulate(entry),
      objectifs:
        entry.attributes.objectifs.length > 0
          ? entry.attributes.objectifs.map((obj) => {
              const result = new ObjectifDefinition({
                titre: obj.titre,
                content_id: null,
                points: obj.points,
                type: null,
                tag_article: null,
                id_cms: null,
              });
              if (obj.article.data) {
                result.type = ContentType.article;
                result.content_id = obj.article.data.id.toString();
                result.id_cms = obj.article.data.id;
              }
              if (obj.tag_article.data) {
                result.type = ContentType.article;
                result.tag_article = obj.tag_article.data.attributes.code;
              }
              if (obj.defi.data) {
                result.type = ContentType.defi;
                result.content_id = obj.defi.data.id.toString();
                result.id_cms = obj.defi.data.id;
              }
              if (obj.quizz.data) {
                result.type = ContentType.quizz;
                result.content_id = obj.quizz.data.id.toString();
                result.id_cms = obj.quizz.data.id;
              }
              if (obj.kyc.data) {
                result.type = ContentType.kyc;
                result.content_id = obj.kyc.data.attributes.code;
                result.id_cms = obj.kyc.data.id;
              }
              if (obj.mosaic.data) {
                result.type = ContentType.mosaic;
                result.content_id = obj.mosaic.data.attributes.code;
                result.id_cms = obj.mosaic.data.id;
              }
              return result;
            })
          : [],
    };
  }

  private static split(list: string) {
    return list ? list.split(',').map((c) => c.trim()) : [];
  }
}
