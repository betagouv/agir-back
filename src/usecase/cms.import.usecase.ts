import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ThematiqueDefinition } from 'src/domain/thematique/thematiqueDefinition';
import { Besoin } from '../../src/domain/aides/besoin';
import { App } from '../../src/domain/app';
import { Categorie } from '../../src/domain/contenu/categorie';
import { ContentType } from '../../src/domain/contenu/contentType';
import { DefiDefinition } from '../../src/domain/defis/defiDefinition';
import { KycDefinition } from '../../src/domain/kyc/kycDefinition';
import {
  MissionDefinition,
  ObjectifDefinition,
} from '../../src/domain/mission/missionDefinition';
import { TagUtilisateur } from '../../src/domain/scoring/tagUtilisateur';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { Echelle } from '../domain/aides/echelle';
import { CategorieRecherche } from '../domain/bibliotheque_services/recherche/categorieRecherche';
import { ArticleDefinition } from '../domain/contenu/articleDefinition';
import { BlockTextDefinition } from '../domain/contenu/BlockTextDefinition';
import { ConformiteDefinition } from '../domain/contenu/conformiteDefinition';
import { PartenaireDefinition } from '../domain/contenu/partenaireDefinition';
import { QuizzDefinition } from '../domain/contenu/quizzDefinition';
import { FAQDefinition } from '../domain/faq/FAQDefinition';
import { parseUnite, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { TagExcluant } from '../domain/scoring/tagExcluant';
import { Thematique } from '../domain/thematique/thematique';
import {
  CMSWebhookPopulateAPI,
  ImageUrlAPI,
  ImageUrlAPI2,
} from '../infrastructure/api/types/cms/CMSWebhookPopulateAPI';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { BlockTextRepository } from '../infrastructure/repository/blockText.repository';
import { ConformiteRepository } from '../infrastructure/repository/conformite.repository';
import { FAQRepository } from '../infrastructure/repository/faq.repository';
import { PartenaireRepository } from '../infrastructure/repository/partenaire.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';

const FULL_POPULATE_URL =
  '?populate[0]=thematiques&populate[1]=imageUrl&populate[2]=partenaire&populate[3]=thematique_gamification&populate[4]=rubriques' +
  '&populate[5]=thematique&populate[6]=tags&populate[7]=besoin&populate[8]=univers&populate[9]=thematique_univers&populate[11]=objectifs' +
  '&populate[12]=thematique_univers_unique&populate[13]=objectifs.article&populate[14]=objectifs.quizz&populate[15]=objectifs.defi' +
  '&populate[16]=objectifs.kyc&populate[17]=reponses&populate[18]=OR_Conditions&populate[19]=OR_Conditions.AND_Conditions&populate[20]=OR_Conditions.AND_Conditions.kyc' +
  '&populate[21]=famille&populate[22]=univers_parent&populate[23]=tag_article&populate[24]=objectifs.tag_article&populate[25]=objectifs.mosaic' +
  '&populate[26]=logo&populate[27]=sources&populate[28]=articles&populate[29]=questions&populate[30]=questions.reponses&populate[31]=actions' +
  '&populate[32]=quizzes&populate[33]=kycs&populate[34]=besoins&populate[35]=action-bilans&populate[36]=action-quizzes&populate[37]=action-classiques' +
  '&populate[38]=action-simulateurs&populate[39]=faqs&populate[40]=texts&populate[41]=tags_excluants';

const enum CMSPluralAPIEndpoint {
  articles = 'articles',
  quizzes = 'quizzes',
  aides = 'aides',
  defis = 'defis',
  kycs = 'kycs',
  faqs = 'faqs',
  texts = 'texts',
  missions = 'missions',
  thematiques = 'thematiques',
  partenaires = 'partenaires',
  conformites = 'conformites',
  actions = 'actions',
  'action-bilans' = 'action-bilans',
  'action-quizzes' = 'action-quizzes',
  'action-classiques' = 'action-classiques',
  'action-simulateurs' = 'action-simulateurs',
}

@Injectable()
export class CMSImportUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private thematiqueRepository: ThematiqueRepository,
    private conformiteRepository: ConformiteRepository,
    private aideRepository: AideRepository,
    private defiRepository: DefiRepository,
    private partenaireRepository: PartenaireRepository,
    private missionRepository: MissionRepository,
    private kycRepository: KycRepository,
    private fAQRepository: FAQRepository,
    private blockTextRepository: BlockTextRepository,
  ) {}

  async loadArticlesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_articles: ArticleDefinition[] = [];
    const CMS_ARTICLE_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.articles,
    );

    for (let index = 0; index < CMS_ARTICLE_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_ARTICLE_DATA[index];
      let article_def: ArticleDefinition;
      try {
        article_def = this.buildArticleFromCMSPopulateData(element);
        liste_articles.push(article_def);
        loading_result.push(`loaded article : ${article_def.content_id}`);
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
    const CMS_DEFI_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.defis,
    );

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

  async loadActionsBilanFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste: ActionDefinition[] = [];
    const CMS_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint['action-bilans'],
    );

    for (let index = 0; index < CMS_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_DATA[index];
      let action: ActionDefinition;
      try {
        action = this.buildActionFromCMSPopulateData(element, TypeAction.bilan);
        liste.push(action);
        loading_result.push(`loaded action-bilan : ${action.cms_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load action-bilan ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste.length; index++) {
      await this.actionRepository.upsert(liste[index]);
    }
    return loading_result;
  }
  async loadActionsQuizzesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste: ActionDefinition[] = [];
    const CMS_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint['action-quizzes'],
    );

    for (let index = 0; index < CMS_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_DATA[index];
      let action: ActionDefinition;
      try {
        action = this.buildActionFromCMSPopulateData(element, TypeAction.quizz);
        liste.push(action);
        loading_result.push(`loaded action quizz : ${action.cms_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load action-quizz ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste.length; index++) {
      await this.actionRepository.upsert(liste[index]);
    }
    return loading_result;
  }

  async getActionClassiqueFromCMS(
    content_id: string,
  ): Promise<ActionDefinition> {
    const CMS_DATA = await this.getSingleObjectDataFromCMS(
      CMSPluralAPIEndpoint['action-classiques'],
      content_id,
    );

    return this.buildActionFromCMSPopulateData(CMS_DATA, TypeAction.classique);
  }

  async loadActionsClassiquesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste: ActionDefinition[] = [];
    const CMS_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint['action-classiques'],
    );

    for (let index = 0; index < CMS_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_DATA[index];
      let action: ActionDefinition;
      try {
        action = this.buildActionFromCMSPopulateData(
          element,
          TypeAction.classique,
        );
        liste.push(action);
        loading_result.push(`loaded action classique : ${action.cms_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load action-classique ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste.length; index++) {
      await this.actionRepository.upsert(liste[index]);
    }
    return loading_result;
  }
  async loadActionsSimulateursFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste: ActionDefinition[] = [];
    const CMS_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint['action-simulateurs'],
    );

    for (let index = 0; index < CMS_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_DATA[index];
      let action: ActionDefinition;
      try {
        action = this.buildActionFromCMSPopulateData(
          element,
          TypeAction.simulateur,
        );
        liste.push(action);
        loading_result.push(`loaded action simulateur : ${action.cms_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load action-simulateur ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste.length; index++) {
      await this.actionRepository.upsert(liste[index]);
    }
    return loading_result;
  }

  async loadPartenairesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_partenaires: PartenaireDefinition[] = [];
    const CMS_PART_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.partenaires,
    );

    for (let index = 0; index < CMS_PART_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_PART_DATA[index];
      let partenaire_def: PartenaireDefinition;
      try {
        partenaire_def = this.buildPartenaireFromCMSPopulateData(element);
        liste_partenaires.push(partenaire_def);
        loading_result.push(`loaded partenaire : ${partenaire_def.id_cms}`);
      } catch (error) {
        loading_result.push(
          `Could not load partenaire ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste_partenaires.length; index++) {
      await this.partenaireRepository.upsert(liste_partenaires[index]);
    }
    return loading_result;
  }

  async loadFAQFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste: FAQDefinition[] = [];
    const CMS_DATA = await this.loadDataFromCMS(CMSPluralAPIEndpoint.faqs);

    for (let index = 0; index < CMS_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_DATA[index];
      let def: FAQDefinition;
      try {
        def = this.buildFAQFromCMSPopulateData(element);
        liste.push(def);
        loading_result.push(`loaded FAQ : ${def.cms_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load FAQ ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste.length; index++) {
      await this.fAQRepository.upsert(liste[index]);
    }
    return loading_result;
  }

  async loadBlockTexteFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste: BlockTextDefinition[] = [];
    const CMS_DATA = await this.loadDataFromCMS(CMSPluralAPIEndpoint.texts);

    for (let index = 0; index < CMS_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_DATA[index];
      let def: BlockTextDefinition;
      try {
        def = this.buildBlockTextFromCMSPopulateData(element);
        liste.push(def);
        loading_result.push(`loaded Block Texte : ${def.cms_id}`);
      } catch (error) {
        loading_result.push(
          `Could not load Block Texte ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (let index = 0; index < liste.length; index++) {
      await this.blockTextRepository.upsert(liste[index]);
    }
    return loading_result;
  }

  async loadKYCFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_kyc: KycDefinition[] = [];
    const CMS_KYC_DATA = await this.loadDataFromCMS(CMSPluralAPIEndpoint.kycs);

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

    // PERF: use Promise.all?
    for (let index = 0; index < liste_kyc.length; index++) {
      await this.kycRepository.upsert(liste_kyc[index]);
    }

    return loading_result;
  }

  async loadMissionsFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_missionsDef: MissionDefinition[] = [];
    const CMS_MISSION_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.missions,
    );

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
    const CMS_THEMATIQUE_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.thematiques,
    );

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

  async loadConformiteFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_confoDef: ConformiteDefinition[] = [];
    const CMS_CONFO_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.conformites,
    );

    for (let index = 0; index < CMS_CONFO_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_CONFO_DATA[index];
      let confo_def: ConformiteDefinition;
      try {
        confo_def = this.buildConformiteFromCMSPopulateData(element);
        liste_confoDef.push(confo_def);
        loading_result.push(
          `loaded conformite : ${confo_def.content_id}/${confo_def.code}`,
        );
      } catch (error) {
        loading_result.push(
          `Could not load conformite ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (const confo_def of liste_confoDef) {
      await this.conformiteRepository.upsert(confo_def);
    }
    return loading_result;
  }

  async loadAidesFromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_aides: AideDefinition[] = [];
    const CMS_AIDE_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.aides,
    );

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
    const liste_quizzes: QuizzDefinition[] = [];
    const CMS_QUIZZ_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint.quizzes,
    );

    for (let index = 0; index < CMS_QUIZZ_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_QUIZZ_DATA[index];
      let quizz: QuizzDefinition;
      try {
        quizz = this.buildQuizzFromCMSPopulateData(element);
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
    type: CMSPluralAPIEndpoint,
  ): Promise<CMSWebhookPopulateAPI[]> {
    let result = [];
    const page_1 = '&pagination[start]=0&pagination[limit]=100';
    const page_2 = '&pagination[start]=100&pagination[limit]=100';
    const page_3 = '&pagination[start]=200&pagination[limit]=100';
    const page_4 = '&pagination[start]=300&pagination[limit]=100';
    const page_5 = '&pagination[start]=400&pagination[limit]=100';
    const page_6 = '&pagination[start]=500&pagination[limit]=100';
    const page_7 = '&pagination[start]=600&pagination[limit]=100';
    const page_8 = '&pagination[start]=700&pagination[limit]=100';
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

    URL = this.buildPopulateURL(page_7, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_8, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    return result;
  }

  private async getSingleObjectDataFromCMS(
    type: CMSPluralAPIEndpoint,
    content_id: string,
  ): Promise<CMSWebhookPopulateAPI> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${App.getCmsApiKey()}`,
    };

    let URL = this.buildPopulateURLSingleObject(type, content_id);
    const response = await axios.get(URL, { headers: headers });
    return response.data.data;
  }

  private buildPopulateURL(page: string, type: CMSPluralAPIEndpoint) {
    const URL = App.getCmsURL().concat('/', type, FULL_POPULATE_URL);
    return URL.concat(page);
  }
  private buildPopulateURLSingleObject(
    type: CMSPluralAPIEndpoint,
    content_id: string,
  ) {
    return App.getCmsURL().concat(
      '/',
      type,
      '/',
      content_id,
      FULL_POPULATE_URL,
    );
  }

  private getImageUrlFromPopulate(imageUrl: ImageUrlAPI) {
    let url = null;
    if (imageUrl) {
      if (imageUrl.data) {
        if (imageUrl.data.attributes.formats.thumbnail) {
          url = imageUrl.data.attributes.formats.thumbnail.url;
        } else {
          url = imageUrl.data.attributes.url;
        }
      }
    }
    return url;
  }

  private getFirstImageUrlFromPopulate(imageUrl: ImageUrlAPI2) {
    let url = null;
    if (imageUrl) {
      if (imageUrl.attributes) {
        if (imageUrl.attributes.formats.thumbnail) {
          url = imageUrl.attributes.formats.thumbnail.url;
        } else {
          url = imageUrl.attributes.url;
        }
      }
    }
    return url;
  }

  private buildPartenaireFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): PartenaireDefinition {
    return {
      id_cms: entry.id.toString(),
      nom: entry.attributes.nom,
      url: entry.attributes.lien,
      image_url: this.getFirstImageUrlFromPopulate(
        entry.attributes.logo.data[0],
      ),
      echelle: Echelle[entry.attributes.echelle],
    };
  }

  private buildBlockTextFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): BlockTextDefinition {
    return {
      cms_id: entry.id.toString(),
      code: entry.attributes.code,
      titre: entry.attributes.titre,
      texte: entry.attributes.texte,
    };
  }

  private buildFAQFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): FAQDefinition {
    return {
      cms_id: entry.id.toString(),
      question: entry.attributes.question,
      reponse: entry.attributes.reponse,
      thematique: entry.attributes.thematique.data
        ? Thematique[entry.attributes.thematique.data.attributes.code]
        : Thematique.climat,
    };
  }

  private buildArticleFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): ArticleDefinition {
    return {
      contenu: entry.attributes.contenu,
      sources: entry.attributes.sources
        ? entry.attributes.sources.map((s) => ({
            label: s.libelle,
            url: s.lien,
          }))
        : [],
      content_id: entry.id.toString(),
      tags_utilisateur: [],
      titre: entry.attributes.titre,
      derniere_maj: entry.attributes.derniere_maj
        ? new Date(entry.attributes.derniere_maj)
        : null,
      soustitre: entry.attributes.sousTitre,
      source: entry.attributes.source,
      image_url: this.getImageUrlFromPopulate(entry.attributes.imageUrl),
      echelle: Echelle[entry.attributes.echelle],
      partenaire_id: entry.attributes.partenaire.data
        ? '' + entry.attributes.partenaire.data.id
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
      categorie: Categorie[entry.attributes.categorie],
      mois: entry.attributes.mois
        ? entry.attributes.mois.split(',').map((m) => parseInt(m))
        : [],
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
    };
  }

  private buildQuizzFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): QuizzDefinition {
    return {
      content_id: entry.id.toString(),
      article_id:
        entry.attributes.articles.data.length > 0
          ? '' + entry.attributes.articles.data[0].id
          : undefined,
      questions: entry.attributes.questions
        ? {
            liste_questions: entry.attributes.questions.map((q) => ({
              libelle: q.libelle,
              explication_ko: q.explicationKO,
              explication_ok: q.explicationOk,
              reponses: q.reponses
                ? q.reponses.map((r) => ({
                    reponse: r.reponse,
                    est_bonne_reponse: r.exact,
                  }))
                : undefined,
            })),
          }
        : undefined,
      tags_utilisateur: [],
      titre: entry.attributes.titre,
      soustitre: entry.attributes.sousTitre,
      source: entry.attributes.source,
      image_url: this.getImageUrlFromPopulate(entry.attributes.imageUrl),
      partenaire_id: entry.attributes.partenaire.data
        ? '' + entry.attributes.partenaire.data.id
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
      categorie: Categorie[entry.attributes.categorie],
      mois: entry.attributes.mois
        ? entry.attributes.mois.split(',').map((m) => parseInt(m))
        : [],
    };
  }
  private buildAideFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): AideDefinition {
    return {
      content_id: entry.id.toString(),
      titre: entry.attributes.titre,
      codes_postaux: CMSImportUsecase.split(entry.attributes.codes_postaux),
      contenu: entry.attributes.description,
      derniere_maj: entry.attributes.derniere_maj
        ? new Date(entry.attributes.derniere_maj)
        : null,
      date_expiration: entry.attributes.date_expiration
        ? new Date(entry.attributes.date_expiration)
        : null,
      partenaire_id: entry.attributes.partenaire.data
        ? '' + entry.attributes.partenaire.data.id
        : null,
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
      echelle: Echelle[entry.attributes.echelle],
      url_source: entry.attributes.url_source,
      url_demande: entry.attributes.url_demande,
      est_gratuit: !!entry.attributes.est_gratuit,
    };
  }

  private buildThematiqueFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): ThematiqueDefinition {
    return {
      id_cms: entry.id,
      label: entry.attributes.label,
      image_url: this.getImageUrlFromPopulate(entry.attributes.imageUrl),
      code: entry.attributes.code,
      emoji: entry.attributes.emoji,
      titre: entry.attributes.titre,
    };
  }
  private buildConformiteFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): ConformiteDefinition {
    return {
      content_id: '' + entry.id,
      code: entry.attributes.code,
      titre: entry.attributes.Titre,
      contenu: entry.attributes.contenu,
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
  private buildActionFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
    type: TypeAction,
  ): ActionDefinition {
    return new ActionDefinition({
      cms_id: entry.id.toString(),
      code: entry.attributes.code,
      titre: entry.attributes.titre,
      sous_titre: entry.attributes.sous_titre,
      pourquoi: entry.attributes.pourquoi,
      comment: entry.attributes.comment,
      quizz_felicitations: entry.attributes.felicitations,
      lvo_objet: entry.attributes.objet_lvo,
      lvo_action: entry.attributes.action_lvo
        ? CategorieRecherche[entry.attributes.action_lvo]
        : null,
      recette_categorie: entry.attributes.categorie_recettes
        ? CategorieRecherche[entry.attributes.categorie_recettes]
        : null,
      type: type,
      besoins:
        entry.attributes.besoins && entry.attributes.besoins.data.length > 0
          ? entry.attributes.besoins.data.map((elem) => elem.attributes.code)
          : [],
      quizz_ids:
        entry.attributes.quizzes && entry.attributes.quizzes.data.length > 0
          ? entry.attributes.quizzes.data.map((elem) => elem.id.toString())
          : [],
      faq_ids:
        entry.attributes.faqs && entry.attributes.faqs.data.length > 0
          ? entry.attributes.faqs.data.map((elem) => elem.id.toString())
          : [],
      kyc_codes:
        entry.attributes.kycs && entry.attributes.kycs.data.length > 0
          ? entry.attributes.kycs.data.map((elem) => elem.attributes.code)
          : [],
      thematique: entry.attributes.thematique.data
        ? Thematique[entry.attributes.thematique.data.attributes.code]
        : null,
      tags_excluants: entry.attributes.tags_excluants.map(
        (t) => TagExcluant[t.valeur],
      ),
    });
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
      unite: parseUnite(entry.attributes.unite),
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
      image_url: this.getImageUrlFromPopulate(entry.attributes.imageUrl),
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
      image_url: this.getImageUrlFromPopulate(entry.attributes.imageUrl),
      est_examen: !!entry.attributes.is_examen,
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
