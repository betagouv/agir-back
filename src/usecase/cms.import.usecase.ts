import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ThematiqueDefinition } from 'src/domain/thematique/thematiqueDefinition';
import { App } from '../../src/domain/app';
import { Categorie } from '../../src/domain/contenu/categorie';
import { KycDefinition } from '../../src/domain/kyc/kycDefinition';
import { TagUtilisateur } from '../../src/domain/scoring/tagUtilisateur';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { Echelle } from '../domain/aides/echelle';
import {
  CategorieRecherche,
  SousCategorieRecherche,
} from '../domain/bibliotheque_services/recherche/categorieRecherche';
import { ArticleDefinition } from '../domain/contenu/articleDefinition';
import { BlockTextDefinition } from '../domain/contenu/BlockTextDefinition';
import { ConformiteDefinition } from '../domain/contenu/conformiteDefinition';
import { PartenaireDefinition } from '../domain/contenu/partenaireDefinition';
import { QuizzDefinition } from '../domain/contenu/quizzDefinition';
import { TagDefinition } from '../domain/contenu/TagDefinition';
import { FAQDefinition } from '../domain/faq/FAQDefinition';
import { parseUnite, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { SousThematique } from '../domain/thematique/sousThematique';
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
import { TagRepository } from '../infrastructure/repository/tag.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { AidesUsecase } from './aides.usecase';

const FULL_POPULATE_URL =
  '?populate[0]=thematiques&populate[1]=imageUrl&populate[2]=partenaire&populate[3]=thematique_gamification&populate[4]=rubriques' +
  '&populate[5]=thematique&populate[6]=tags&populate[7]=besoin&populate[8]=univers&populate[9]=thematique_univers&populate[11]=objectifs' +
  '&populate[12]=thematique_univers_unique&populate[13]=objectifs.article&populate[14]=objectifs.quizz&populate[15]=objectifs.defi' +
  '&populate[16]=objectifs.kyc&populate[17]=reponses&populate[18]=OR_Conditions&populate[19]=OR_Conditions.AND_Conditions&populate[20]=OR_Conditions.AND_Conditions.kyc' +
  '&populate[21]=famille&populate[22]=univers_parent&populate[23]=tag_article&populate[24]=objectifs.tag_article&populate[25]=objectifs.mosaic' +
  '&populate[26]=logo&populate[27]=sources&populate[28]=articles&populate[29]=questions&populate[30]=questions.reponses&populate[31]=actions' +
  '&populate[32]=quizzes&populate[33]=kycs&populate[34]=besoins&populate[35]=action-bilans&populate[36]=action-quizzes&populate[37]=action-classiques' +
  '&populate[38]=action-simulateurs&populate[39]=faqs&populate[40]=texts&populate[41]=tags_excluants&populate[42]=partenaires&populate[43]=tag_v2_excluants&populate[44]=tag_v2_incluants&populate[45]=tag_v2_incluants' +
  '&populate[46]=sous_thematique';

const enum CMSPluralAPIEndpoint {
  articles = 'articles',
  'tag-v2s' = 'tag-v2s',
  quizzes = 'quizzes',
  aides = 'aides',
  kycs = 'kycs',
  faqs = 'faqs',
  texts = 'texts',
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
    private partenaireRepository: PartenaireRepository,
    private kycRepository: KycRepository,
    private fAQRepository: FAQRepository,
    private blockTextRepository: BlockTextRepository,
    private aidesUsecase: AidesUsecase,
    private tagRepository: TagRepository,
  ) {}

  async loadTagsV2FromCMS(): Promise<string[]> {
    const loading_result: string[] = [];
    const liste_tags: TagDefinition[] = [];
    const CMS_TAG_DATA = await this.loadDataFromCMS(
      CMSPluralAPIEndpoint['tag-v2s'],
    );

    for (let index = 0; index < CMS_TAG_DATA.length; index++) {
      const element: CMSWebhookPopulateAPI = CMS_TAG_DATA[index];
      let tag_def: TagDefinition;
      try {
        tag_def = this.buildTagFromCMSPopulateData(element);
        liste_tags.push(tag_def);
        loading_result.push(`loaded tag def : ${tag_def.cms_id}`);
      } catch (error) {
        console.log(error);
        loading_result.push(
          `Could not load tag def ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    for (const tag_def of liste_tags) {
      await this.tagRepository.upsert(tag_def);
    }
    return loading_result;
  }

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

  async getAideFromCMS(content_id: string): Promise<AideDefinition> {
    const CMS_DATA = await this.getSingleObjectDataFromCMS(
      CMSPluralAPIEndpoint['aides'],
      content_id,
    );

    return this.buildAideFromCMSPopulateData(CMS_DATA);
  }

  async getArticleFromCMS(content_id: string): Promise<ArticleDefinition> {
    const CMS_DATA = await this.getSingleObjectDataFromCMS(
      CMSPluralAPIEndpoint['articles'],
      content_id,
    );

    return this.buildArticleFromCMSPopulateData(CMS_DATA);
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
    for (const part_def of liste_partenaires) {
      await this.partenaireRepository.upsert(part_def);
    }

    await this.partenaireRepository.loadCache();

    for (const part_def of liste_partenaires) {
      const liste_aides = await this.aideRepository.findAidesByPartenaireId(
        part_def.id_cms,
      );

      for (const aide of liste_aides) {
        const computed =
          this.aidesUsecase.external_compute_communes_departement_regions_from_liste_partenaires(
            aide.partenaires_supp_ids,
          );

        await this.aideRepository.updateAideCodesFromPartenaire(
          aide.content_id,
          computed.codes_commune,
          computed.codes_departement,
          computed.codes_region,
        );
        loading_result.push(
          `loaded_partenaire updating_aide: ${aide.content_id}`,
        );
      }
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
          `Could not load aide ${element.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(element));
      }
    }
    /*
    for (const aide of liste_aides) {
      await this.aideRepository.upsert(aide);
      const computed =
        this.aidesUsecase.external_compute_communes_departement_regions_from_liste_partenaires(
          aide.partenaires_supp_ids,
        );

      await this.aideRepository.updateAideCodesFromPartenaire(
        aide.content_id,
        computed.codes_commune,
        computed.codes_departement,
        computed.codes_region,
      );
      loading_result.push(
        `loaded_partenaire updating_aide: ${aide.content_id}`,
      );
    }
      */
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
    let response = null;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${App.getCmsApiKey()}`,
    };

    for (let index = 0; index < 1000; index = index + 100) {
      let URL = this.buildPopulateURL(
        `&pagination[start]=${index}&pagination[limit]=100`,
        type,
      );
      response = await axios.get(URL, { headers: headers });
      result = result.concat(response.data.data);
      if (response.data.data.length === 0) {
        break;
      }
    }

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
      image_url: entry.attributes.logo.data
        ? this.getFirstImageUrlFromPopulate(entry.attributes.logo.data[0])
        : null,
      echelle: Echelle[entry.attributes.echelle],
      code_commune: entry.attributes.code_commune,
      code_epci: entry.attributes.code_epci,
      code_departement: entry.attributes.code_departement,
      code_region: entry.attributes.code_region,
      liste_codes_commune_from_EPCI:
        this.aidesUsecase.external_compute_communes_from_epci(
          entry.attributes.code_epci,
        ),
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
      tags_a_exclure:
        entry.attributes.tag_v2_excluants &&
        entry.attributes.tag_v2_excluants.data.length > 0
          ? entry.attributes.tag_v2_excluants.data.map(
              (elem) => elem.attributes.code,
            )
          : [],
      tags_a_inclure:
        entry.attributes.tag_v2_incluants &&
        entry.attributes.tag_v2_incluants.data.length > 0
          ? entry.attributes.tag_v2_incluants.data.map(
              (elem) => elem.attributes.code,
            )
          : [],
      VISIBLE_PROD: this.trueIfUndefinedOrNull(entry.attributes.VISIBLE_PROD),
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],
    };
  }

  private buildTagFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): TagDefinition {
    return {
      cms_id: entry.id.toString(),
      tag: entry.attributes.code,
      boost: entry.attributes.boost_absolu,
      ponderation: entry.attributes.ponderation,
      description: entry.attributes.description,
      label_explication: entry.attributes.label_explication,
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
    const result = {
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
      partenaires_supp_ids: entry.attributes.partenaires.data
        ? entry.attributes.partenaires.data.map((p) => p.id.toString())
        : [],
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],
      thematiques:
        entry.attributes.thematiques.data.length > 0
          ? entry.attributes.thematiques.data.map(
              (elem) => Thematique[elem.attributes.code],
            )
          : [],
      is_simulateur: entry.attributes.is_simulation ? true : false,
      montant_max: entry.attributes.montantMaximum
        ? Math.round(parseFloat(entry.attributes.montantMaximum))
        : null,
      url_simulateur: entry.attributes.url_detail_front,
      besoin: entry.attributes.besoin.data
        ? entry.attributes.besoin.data.attributes.code
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
      VISIBLE_PROD: this.trueIfUndefinedOrNull(entry.attributes.VISIBLE_PROD),
    };

    const computed =
      this.aidesUsecase.external_compute_communes_departement_regions_from_liste_partenaires(
        result.partenaires_supp_ids,
      );

    result.codes_commune_from_partenaire = computed.codes_commune;
    result.codes_departement_from_partenaire = computed.codes_departement;
    result.codes_region_from_partenaire = computed.codes_region;

    return result;
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

  private buildActionFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
    type: TypeAction,
  ): ActionDefinition {
    return new ActionDefinition({
      cms_id: entry.id.toString(),
      code: entry.attributes.code,
      titre: entry.attributes.titre,
      titre_recherche: entry.attributes.titre
        ? entry.attributes.titre.replaceAll('*', '')
        : '',
      sous_titre: entry.attributes.sous_titre,
      consigne:
        entry.attributes.consigne ||
        'Réalisez cette action dans les prochaines semaines et partagez vos retours',
      label_compteur:
        entry.attributes.label_compteur ||
        '**{NBR_ACTIONS}** actions réalisées par la communauté',
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
      recette_sous_categorie: entry.attributes.sous_categorie_recettes
        ? SousCategorieRecherche[entry.attributes.sous_categorie_recettes]
        : null,
      pdcn_categorie: entry.attributes.categorie_pdcn
        ? CategorieRecherche[entry.attributes.categorie_pdcn]
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
      article_ids:
        entry.attributes.articles && entry.attributes.articles.data.length > 0
          ? entry.attributes.articles.data.map((elem) => elem.id.toString())
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
      sous_thematique: entry.attributes.sous_thematique.data
        ? SousThematique[entry.attributes.sous_thematique.data.attributes.code]
        : null,
      sources: entry.attributes.sources
        ? entry.attributes.sources.map((s) => ({
            label: s.libelle,
            url: s.lien,
          }))
        : [],
      tags_a_exclure:
        entry.attributes.tag_v2_excluants &&
        entry.attributes.tag_v2_excluants.data.length > 0
          ? entry.attributes.tag_v2_excluants.data.map(
              (elem) => elem.attributes.code,
            )
          : [],
      tags_a_inclure:
        entry.attributes.tag_v2_incluants &&
        entry.attributes.tag_v2_incluants.data.length > 0
          ? entry.attributes.tag_v2_incluants.data.map(
              (elem) => elem.attributes.code,
            )
          : [],
      VISIBLE_PROD: this.trueIfUndefinedOrNull(entry.attributes.VISIBLE_PROD),
      emoji: entry.attributes.emoji,
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

  private static split(list: string) {
    return list ? list.split(',').map((c) => c.trim()) : [];
  }

  private trueIfUndefinedOrNull(value: boolean) {
    if (value === undefined || value === null) return true;
    return value;
  }
}
