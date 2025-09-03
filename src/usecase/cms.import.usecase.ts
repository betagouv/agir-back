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
import { QuizzDefinition } from '../domain/contenu/quizzDefinition';
import { SelectionDefinition } from '../domain/contenu/SelectionDefinition';
import { TagDefinition } from '../domain/contenu/TagDefinition';
import { FAQDefinition } from '../domain/faq/FAQDefinition';
import { parseUnite, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { PartenaireDefinition } from '../domain/partenaires/partenaireDefinition';
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
import { SelectionRepository } from '../infrastructure/repository/selection.repository';
import { TagRepository } from '../infrastructure/repository/tag.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { ActionCMSDataHelper } from './CMSDataHelper.usecase';
import { PartenaireUsecase } from './partenaire.usecase';

const FULL_POPULATE_URL =
  '?populate[0]=thematiques&populate[1]=imageUrl&populate[2]=partenaire&populate[3]=thematique_gamification&populate[4]=rubriques' +
  '&populate[5]=thematique&populate[6]=tags&populate[7]=besoin&populate[8]=univers&populate[9]=thematique_univers&populate[11]=objectifs' +
  '&populate[12]=thematique_univers_unique&populate[13]=objectifs.article&populate[14]=objectifs.quizz&populate[15]=objectifs.defi' +
  '&populate[16]=objectifs.kyc&populate[17]=reponses&populate[18]=OR_Conditions&populate[19]=OR_Conditions.AND_Conditions&populate[20]=OR_Conditions.AND_Conditions.kyc' +
  '&populate[21]=famille&populate[22]=univers_parent&populate[23]=tag_article&populate[24]=objectifs.tag_article&populate[25]=objectifs.mosaic' +
  '&populate[26]=logo&populate[27]=sources&populate[28]=articles&populate[29]=questions&populate[30]=questions.reponses&populate[31]=actions' +
  '&populate[32]=quizzes&populate[33]=kycs&populate[34]=besoins&populate[35]=action-bilans&populate[36]=action-quizzes&populate[37]=action-classiques' +
  '&populate[38]=action-simulateurs&populate[39]=faqs&populate[40]=texts&populate[41]=tags_excluants&populate[42]=partenaires&populate[43]=tag_v2_excluants&populate[44]=tag_v2_incluants&populate[45]=tag_v2_incluants' +
  '&populate[46]=sous_thematique&populate[47]=selections';

const enum CMSPluralAPIEndpoint {
  articles = 'articles',
  'tag-v2s' = 'tag-v2s',
  quizzes = 'quizzes',
  selections = 'selections',
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
    private partenaireUsecase: PartenaireUsecase,
    private tagRepository: TagRepository,
    private selectionRepository: SelectionRepository,
  ) {}

  async loadTagsV2FromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint['tag-v2s'],
      this.tagRepository,
      this.buildTagFromCMSPopulateData,
    );
  }

  async loadSelectionsFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint['selections'],
      this.selectionRepository,
      this.buildSelectionFromCMSPopulateData,
    );
  }

  async loadArticlesFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.articles,
      this.articleRepository,
      (e) =>
        CMSImportUsecase.buildArticleFromCMSPopulateData(
          e,
          this.partenaireUsecase,
        ),
    );
  }

  async loadActionsBilanFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint['action-bilans'],
      this.actionRepository,
      (data: CMSWebhookPopulateAPI) =>
        this.buildActionFromCMSPopulateData(data, TypeAction.bilan),
    );
  }

  async loadActionsQuizzesFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint['action-quizzes'],
      this.actionRepository,
      (data: CMSWebhookPopulateAPI) =>
        this.buildActionFromCMSPopulateData(data, TypeAction.quizz),
    );
  }

  async loadActionsClassiquesFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint['action-classiques'],
      this.actionRepository,
      (data: CMSWebhookPopulateAPI) =>
        this.buildActionFromCMSPopulateData(data, TypeAction.classique),
    );
  }

  async loadActionsSimulateursFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint['action-simulateurs'],
      this.actionRepository,
      (data: CMSWebhookPopulateAPI) =>
        this.buildActionFromCMSPopulateData(data, TypeAction.simulateur),
    );
  }

  async loadPartenairesFromCMS(): Promise<string[]> {
    let loading_result = await this.loadFromCMS(
      CMSPluralAPIEndpoint.partenaires,
      this.partenaireRepository,
      (e) =>
        CMSImportUsecase.buildPartenaireFromCMSPopulateData(
          e,
          this.partenaireUsecase,
        ),
    );

    for (const part_def of PartenaireRepository.getAllPartenaires()) {
      loading_result.push(
        `loaded partenaire updating codes: ${part_def.id_cms}`,
      );
      await this.partenaireUsecase.updateFromPartenaireCodes(
        this.aideRepository,
        part_def.id_cms,
      );
      await this.partenaireUsecase.updateFromPartenaireCodes(
        this.articleRepository,
        part_def.id_cms,
      );
    }

    return loading_result;
  }

  async loadFAQFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.faqs,
      this.fAQRepository,
      this.buildFAQFromCMSPopulateData,
    );
  }

  async loadBlockTexteFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.texts,
      this.blockTextRepository,
      this.buildBlockTextFromCMSPopulateData,
    );
  }

  async loadKYCFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.kycs,
      this.kycRepository,
      this.buildKYCFromCMSPopulateData,
    );
  }

  async loadThematiquesFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.thematiques,
      this.thematiqueRepository,
      this.buildThematiqueFromCMSPopulateData,
    );
  }

  async loadConformiteFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.conformites,
      this.conformiteRepository,
      this.buildConformiteFromCMSPopulateData,
    );
  }

  async loadAidesFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.aides,
      this.aideRepository,
      (e) =>
        CMSImportUsecase.buildAideFromCMSPopulateData(
          e,
          this.partenaireUsecase,
        ),
    );
  }

  async loadQuizzFromCMS(): Promise<string[]> {
    return await this.loadFromCMS(
      CMSPluralAPIEndpoint.quizzes,
      this.quizzRepository,
      this.buildQuizzFromCMSPopulateData,
    );
  }

  private async loadFromCMS<
    E_Definition extends
      | { cms_id: string }
      | { content_id: string }
      | { id_cms: string | number },
  >(
    cmsApiEndpoint: CMSPluralAPIEndpoint,
    repository: WithCache & {
      upsert: (e: E_Definition) => Promise<void>;
    },
    buildFromCMSPopulateData: (data: CMSWebhookPopulateAPI) => E_Definition,
  ): Promise<string[]> {
    const loading_result: string[] = [];
    const definitions: E_Definition[] = [];
    const CMS_DATA = await this.loadDataFromCMS(cmsApiEndpoint);

    for (let index = 0; index < CMS_DATA.length; index++) {
      const data: CMSWebhookPopulateAPI = CMS_DATA[index];

      try {
        const def = buildFromCMSPopulateData(data);
        definitions.push(def);
        loading_result.push(
          `loaded definition : ${
            def['cms_id'] ?? def['content_id'] ?? def['id_cms']
          }`,
        );
      } catch (error) {
        console.log(error);
        loading_result.push(
          `Could not load definition ${data.id} : ${error.message}`,
        );
        loading_result.push(JSON.stringify(data));
      }
    }
    for (const def of definitions) {
      await repository.upsert(def);
    }

    await repository.loadCache();

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

    return CMSImportUsecase.buildAideFromCMSPopulateData(
      CMS_DATA,
      this.partenaireUsecase,
    );
  }

  async getArticleFromCMS(content_id: string): Promise<ArticleDefinition> {
    const CMS_DATA = await this.getSingleObjectDataFromCMS(
      CMSPluralAPIEndpoint['articles'],
      content_id,
    );

    return CMSImportUsecase.buildArticleFromCMSPopulateData(
      CMS_DATA,
      this.partenaireUsecase,
    );
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

  private static getImageUrlFromPopulate(imageUrl: ImageUrlAPI) {
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

  private static getFirstImageUrlFromPopulate(imageUrl: ImageUrlAPI2) {
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

  private static buildPartenaireFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
    partenaireUsecase: PartenaireUsecase,
  ): PartenaireDefinition {
    return {
      id_cms: entry.id.toString(),
      nom: entry.attributes.nom,
      url: entry.attributes.lien,
      image_url: entry.attributes.logo.data
        ? CMSImportUsecase.getFirstImageUrlFromPopulate(
            entry.attributes.logo.data[0],
          )
        : null,
      echelle: Echelle[entry.attributes.echelle],
      code_commune: entry.attributes.code_commune,
      code_epci: entry.attributes.code_epci,
      code_departement: entry.attributes.code_departement,
      code_region: entry.attributes.code_region,
      liste_codes_commune_from_EPCI:
        partenaireUsecase.external_compute_communes_from_epci(
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

  private static buildArticleFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
    partenaireUsecase: PartenaireUsecase,
  ): ArticleDefinition {
    const result = {
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
      image_url: CMSImportUsecase.getImageUrlFromPopulate(
        entry.attributes.imageUrl,
      ),
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
      VISIBLE_PROD: CMSImportUsecase.trueIfUndefinedOrNull(
        entry.attributes.VISIBLE_PROD,
      ),
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],
    };

    const computed =
      partenaireUsecase.external_compute_communes_departement_regions_from_liste_partenaires(
        [result.partenaire_id],
      );

    result.codes_commune_from_partenaire = computed.codes_commune;
    result.codes_departement_from_partenaire = computed.codes_departement;
    result.codes_region_from_partenaire = computed.codes_region;

    return new ArticleDefinition(result);
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

  private buildSelectionFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): SelectionDefinition {
    return {
      cms_id: entry.id.toString(),
      code: entry.attributes.code,
      description: entry.attributes.description,
      titre: entry.attributes.titre,
      image_url: CMSImportUsecase.getImageUrlFromPopulate(
        entry.attributes.imageUrl,
      ),
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
      image_url: CMSImportUsecase.getImageUrlFromPopulate(
        entry.attributes.imageUrl,
      ),
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
  private static buildAideFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
    partenaireUsecase: PartenaireUsecase,
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
      VISIBLE_PROD: CMSImportUsecase.trueIfUndefinedOrNull(
        entry.attributes.VISIBLE_PROD,
      ),
    };

    const computed =
      partenaireUsecase.external_compute_communes_departement_regions_from_liste_partenaires(
        result.partenaires_supp_ids,
      );

    result.codes_commune_from_partenaire = computed.codes_commune;
    result.codes_departement_from_partenaire = computed.codes_departement;
    result.codes_region_from_partenaire = computed.codes_region;

    return new AideDefinition(result);
  }

  private buildThematiqueFromCMSPopulateData(
    entry: CMSWebhookPopulateAPI,
  ): ThematiqueDefinition {
    return {
      id_cms: entry.id,
      label: entry.attributes.label,
      image_url: CMSImportUsecase.getImageUrlFromPopulate(
        entry.attributes.imageUrl,
      ),
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
      external_id: entry.attributes.external_id,
      partenaire_id:
        entry.attributes.partenaire && entry.attributes.partenaire.data
          ? '' + entry.attributes.partenaire.data.id
          : null,
      code: entry.attributes.code,
      titre: entry.attributes.titre,
      titre_recherche: ActionCMSDataHelper.getTitreRcherche(
        entry.attributes.titre,
      ),
      sous_titre: entry.attributes.sous_titre,
      consigne: ActionCMSDataHelper.getConsigne(entry.attributes.consigne),
      label_compteur: ActionCMSDataHelper.getLabelCompteur(
        entry.attributes.label_compteur,
      ),
      pourquoi: entry.attributes.pourquoi,
      comment: entry.attributes.comment,
      quizz_felicitations: entry.attributes.felicitations,
      lvo_objet: entry.attributes.objet_lvo
        ? SousCategorieRecherche[entry.attributes.objet_lvo]
        : null,
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
      sources: ActionCMSDataHelper.getSources(entry.attributes.sources),
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

      selections:
        entry.attributes.selections &&
        entry.attributes.selections.data.length > 0
          ? entry.attributes.selections.data.map((elem) => elem.attributes.code)
          : [],

      VISIBLE_PROD: CMSImportUsecase.trueIfUndefinedOrNull(
        entry.attributes.VISIBLE_PROD,
      ),
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
      sous_titre: entry.attributes.sous_titre,
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
      image_url: CMSImportUsecase.getImageUrlFromPopulate(
        entry.attributes.imageUrl,
      ),
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

  private static trueIfUndefinedOrNull(value: boolean) {
    if (value === undefined || value === null) return true;
    return value;
  }
}
