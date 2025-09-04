import { Injectable } from '@nestjs/common';
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
import { Categorie } from '../domain/contenu/categorie';
import { ConformiteDefinition } from '../domain/contenu/conformiteDefinition';
import { QuizzDefinition } from '../domain/contenu/quizzDefinition';
import { SelectionDefinition } from '../domain/contenu/SelectionDefinition';
import { TagDefinition } from '../domain/contenu/TagDefinition';
import { FAQDefinition } from '../domain/faq/FAQDefinition';
import { KycDefinition } from '../domain/kyc/kycDefinition';
import { parseUnite, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { PartenaireDefinition } from '../domain/partenaires/partenaireDefinition';
import { TagUtilisateur } from '../domain/scoring/tagUtilisateur';
import { Thematique } from '../domain/thematique/thematique';
import { CMSEvent } from '../infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../infrastructure/api/types/cms/CMSModels';
import { CMSWebhookAPI } from '../infrastructure/api/types/cms/CMSWebhookAPI';
import {
  CMSWebhookEntryAPI,
  CMSWebhookRubriqueAPI,
} from '../infrastructure/api/types/cms/CMSWebhookEntryAPI';
import { CMSWebhookImageURLAPI } from '../infrastructure/api/types/cms/CMSWebhookImageURLAPI';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { BlockTextRepository } from '../infrastructure/repository/blockText.repository';
import { ConformiteRepository } from '../infrastructure/repository/conformite.repository';
import { FAQRepository } from '../infrastructure/repository/faq.repository';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { PartenaireRepository } from '../infrastructure/repository/partenaire.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { SelectionRepository } from '../infrastructure/repository/selection.repository';
import { TagRepository } from '../infrastructure/repository/tag.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { ActionCMSDataHelper } from './CMSDataHelper.usecase';
import { PartenaireUsecase } from './partenaire.usecase';

@Injectable()
export class CMSWebhookUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private thematiqueRepository: ThematiqueRepository,
    private aideRepository: AideRepository,
    private conformiteRepository: ConformiteRepository,
    private partenaireRepository: PartenaireRepository,
    private kycRepository: KycRepository,
    private fAQRepository: FAQRepository,
    private blockTextRepository: BlockTextRepository,
    private tagRepository: TagRepository,
    private selectionRepository: SelectionRepository,
    private partenaireUsecase: PartenaireUsecase,
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

    if (cmsWebhookAPI.model.startsWith('action')) {
      const mapping_type_action: { [K in CMSModel]?: TypeAction } = {
        'action-classique': TypeAction.classique,
        'action-quizz': TypeAction.quizz,
        'action-bilan': TypeAction.bilan,
        'action-simulateur': TypeAction.simulateur,
        action: TypeAction[cmsWebhookAPI.entry.type_action],
      };

      cmsWebhookAPI.entry.type_action =
        mapping_type_action[cmsWebhookAPI.model];

      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteAction(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteAction(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateAction(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateAction(cmsWebhookAPI);
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
    if (cmsWebhookAPI.model === CMSModel.faq) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteFAQ(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteFAQ(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateFAQ(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateFAQ(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel.text) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteBlockTexte(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteBlockTexte(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateBlockTexte(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateBlockTexte(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel['tag-v2']) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteTag(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteTag(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateTag(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateTag(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel['selection']) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteSelection(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteSelection(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateSelection(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateSelection(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel.conformite) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deleteConformite(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deleteConformite(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdateConformite(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdateConformite(cmsWebhookAPI);
      }
    }
    if (cmsWebhookAPI.model === CMSModel.partenaire) {
      switch (cmsWebhookAPI.event) {
        case CMSEvent['entry.unpublish']:
          return this.deletePartenaire(cmsWebhookAPI);
        case CMSEvent['entry.delete']:
          return this.deletePartenaire(cmsWebhookAPI);
        case CMSEvent['entry.publish']:
          return this.createOrUpdatePartenaire(cmsWebhookAPI);
        case CMSEvent['entry.update']:
          return this.createOrUpdatePartenaire(cmsWebhookAPI);
      }
    }
  }

  async deleteAide(cmsWebhookAPI: CMSWebhookAPI) {
    await this.aideRepository.delete(cmsWebhookAPI.entry.id.toString());
  }

  async deleteFAQ(cmsWebhookAPI: CMSWebhookAPI) {
    await this.fAQRepository.delete(cmsWebhookAPI.entry.id.toString());
  }
  async deleteBlockTexte(cmsWebhookAPI: CMSWebhookAPI) {
    await this.blockTextRepository.delete(cmsWebhookAPI.entry.id.toString());
  }
  async deleteTag(cmsWebhookAPI: CMSWebhookAPI) {
    await this.tagRepository.delete(cmsWebhookAPI.entry.id.toString());
  }

  async deleteSelection(cmsWebhookAPI: CMSWebhookAPI) {
    await this.selectionRepository.delete(cmsWebhookAPI.entry.id.toString());
  }

  async deleteConformite(cmsWebhookAPI: CMSWebhookAPI) {
    await this.conformiteRepository.delete(cmsWebhookAPI.entry.id.toString());
  }
  async deletePartenaire(cmsWebhookAPI: CMSWebhookAPI) {
    await this.partenaireRepository.delete(cmsWebhookAPI.entry.id.toString());
  }

  async createOrUpdateAide(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    const aide_to_upsert = this.buildAideFromCMSData(cmsWebhookAPI.entry);
    await this.aideRepository.upsert(aide_to_upsert);
  }
  async createOrUpdateFAQ(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.fAQRepository.upsert(
      this.buildFAQFromCMSData(cmsWebhookAPI.entry),
    );
  }
  async createOrUpdateBlockTexte(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.blockTextRepository.upsert(
      this.buildBlockTexteFromCMSData(cmsWebhookAPI.entry),
    );
  }
  async createOrUpdateTag(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.tagRepository.upsert(
      this.buildTagFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async createOrUpdateSelection(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.selectionRepository.upsert(
      this.buildSelectionFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async createOrUpdateConformite(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.conformiteRepository.upsert(
      this.buildConformiteFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async createOrUpdatePartenaire(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.partenaireRepository.upsert(
      this.buildPartenaireFromCMSData(cmsWebhookAPI.entry),
    );

    await this.partenaireRepository.loadCache();

    const partenaire_id = '' + cmsWebhookAPI.entry.id;
    await this.partenaireUsecase.updateFromPartenaireCodes(
      this.aideRepository,
      partenaire_id,
    );
    await this.partenaireUsecase.updateFromPartenaireCodes(
      this.articleRepository,
      partenaire_id,
    );
  }

  async createOrUpdateThematique(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.thematiqueRepository.upsert({
      id_cms: cmsWebhookAPI.entry.id,
      titre: cmsWebhookAPI.entry.titre,
      code: cmsWebhookAPI.entry.code,
      emoji: cmsWebhookAPI.entry.emoji,
      image_url: this.getImageUrlFromImageField(cmsWebhookAPI.entry.imageUrl),
      label: cmsWebhookAPI.entry.label,
    });
  }

  async createOrUpdateKyc(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.kycRepository.upsert(
      this.buildKycFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async createOrUpdateAction(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.actionRepository.upsert(
      this.buildActionFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async deleteKyc(cmsWebhookAPI: CMSWebhookAPI) {
    await this.kycRepository.delete(cmsWebhookAPI.entry.id);
  }
  async deleteAction(cmsWebhookAPI: CMSWebhookAPI) {
    await this.actionRepository.delete(
      cmsWebhookAPI.entry.id.toString(),
      TypeAction[cmsWebhookAPI.entry.type_action],
    );
  }

  private getImageUrlFromImageField(image_field: CMSWebhookImageURLAPI) {
    let url = null;
    if (image_field) {
      if (image_field.formats && image_field.formats.thumbnail) {
        url = image_field.formats.thumbnail.url;
      } else {
        url = image_field.url;
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
        this.buildArticleFromCMSData(cmsWebhookAPI),
      );
    }
    if (cmsWebhookAPI.model === CMSModel.quizz) {
      await this.quizzRepository.upsert(
        this.buildQuizzFromCMSData(cmsWebhookAPI),
      );
    }
  }

  private buildArticleFromCMSData(hook: CMSWebhookAPI): ArticleDefinition {
    const result = new ArticleDefinition({
      contenu: hook.entry.contenu,
      sources: hook.entry.sources
        ? hook.entry.sources.map((s) => ({ label: s.libelle, url: s.lien }))
        : [],
      content_id: hook.entry.id.toString(),
      tags_utilisateur: [],
      titre: hook.entry.titre,
      derniere_maj: hook.entry.derniere_maj
        ? new Date(hook.entry.derniere_maj)
        : null,
      soustitre: hook.entry.sousTitre,
      source: hook.entry.source,
      image_url: this.getImageUrlFromImageField(hook.entry.imageUrl),
      partenaire_id: hook.entry.partenaire
        ? '' + hook.entry.partenaire.id
        : null,
      echelle: Echelle[hook.entry.echelle],
      rubrique_ids: this.getIdsFromRubriques(hook.entry.rubriques),
      rubrique_labels: this.getTitresFromRubriques(hook.entry.rubriques),
      codes_postaux: this.split(hook.entry.codes_postaux),
      duree: hook.entry.duree,
      frequence: hook.entry.frequence,
      difficulty: hook.entry.difficulty ? hook.entry.difficulty : 1,
      points: hook.entry.points ? hook.entry.points : 0,
      thematique_principale: hook.entry.thematique_gamification
        ? Thematique[hook.entry.thematique_gamification.code]
        : Thematique.climat,
      thematiques: hook.entry.thematiques
        ? hook.entry.thematiques.map((elem) => Thematique[elem.code])
        : [],
      categorie: Categorie[hook.entry.categorie],
      mois: hook.entry.mois
        ? hook.entry.mois.split(',').map((m) => parseInt(m))
        : [],
      include_codes_commune: this.split(hook.entry.include_codes_commune),
      exclude_codes_commune: this.split(hook.entry.exclude_codes_commune),
      codes_departement: this.split(hook.entry.codes_departement),
      codes_region: this.split(hook.entry.codes_region),
      tags_a_exclure: hook.entry.tag_v2_excluants
        ? hook.entry.tag_v2_excluants.map((elem) => elem.code)
        : [],
      tags_a_inclure: hook.entry.tag_v2_incluants
        ? hook.entry.tag_v2_incluants.map((elem) => elem.code)
        : [],
      VISIBLE_PROD: this.trueIfUndefinedOrNull(hook.entry.VISIBLE_PROD),
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],
    });

    const computed =
      this.partenaireUsecase.external_compute_communes_departement_regions_from_liste_partenaires(
        [result.partenaire_id],
      );

    result.codes_commune_from_partenaire = computed.codes_commune;
    result.codes_departement_from_partenaire = computed.codes_departement;
    result.codes_region_from_partenaire = computed.codes_region;

    return result;
  }

  private buildQuizzFromCMSData(hook: CMSWebhookAPI): QuizzDefinition {
    return {
      content_id: hook.entry.id.toString(),
      article_id: hook.entry.articles[0]
        ? '' + hook.entry.articles[0].id
        : null,
      questions: {
        liste_questions: hook.entry.questions.map((q) => ({
          libelle: q.libelle,
          explication_ko: q.explicationKO,
          explication_ok: q.explicationOk,
          reponses: q.reponses.map((r) => ({
            reponse: r.reponse,
            est_bonne_reponse: r.exact,
          })),
        })),
      },
      tags_utilisateur: [],
      titre: hook.entry.titre,
      soustitre: hook.entry.sousTitre,
      source: hook.entry.source,
      image_url: this.getImageUrlFromImageField(hook.entry.imageUrl),
      partenaire_id: hook.entry.partenaire
        ? '' + hook.entry.partenaire.id
        : null,
      rubrique_ids: this.getIdsFromRubriques(hook.entry.rubriques),
      rubrique_labels: this.getTitresFromRubriques(hook.entry.rubriques),
      codes_postaux: this.split(hook.entry.codes_postaux),
      duree: hook.entry.duree,
      frequence: hook.entry.frequence,
      difficulty: hook.entry.difficulty ? hook.entry.difficulty : 1,
      points: hook.entry.points ? hook.entry.points : 0,
      thematique_principale: hook.entry.thematique_gamification
        ? Thematique[hook.entry.thematique_gamification.code]
        : Thematique.climat,
      thematiques: hook.entry.thematiques
        ? hook.entry.thematiques.map((elem) => Thematique[elem.code])
        : [],
      categorie: Categorie[hook.entry.categorie],
      mois: hook.entry.mois
        ? hook.entry.mois.split(',').map((m) => parseInt(m))
        : [],
    };
  }

  private buildAideFromCMSData(entry: CMSWebhookEntryAPI): AideDefinition {
    const result = new AideDefinition({
      content_id: entry.id.toString(),
      titre: entry.titre,
      date_expiration: entry.date_expiration
        ? new Date(entry.date_expiration)
        : null,
      derniere_maj: entry.derniere_maj ? new Date(entry.derniere_maj) : null,
      partenaires_supp_ids: entry.partenaires
        ? entry.partenaires.map((p) => p.id.toString())
        : [],
      codes_postaux: this.split(entry.codes_postaux),
      thematiques: entry.thematiques
        ? entry.thematiques.map((elem) => Thematique[elem.code])
        : [],
      contenu: entry.description,
      is_simulateur: entry.is_simulation ? true : false,
      montant_max: entry.montantMaximum
        ? Math.round(parseFloat(entry.montantMaximum))
        : null,
      url_simulateur: entry.url_detail_front,
      besoin: entry.besoin ? entry.besoin.code : null,
      besoin_desc: entry.besoin ? entry.besoin.description : null,
      include_codes_commune: this.split(entry.include_codes_commune),
      exclude_codes_commune: this.split(entry.exclude_codes_commune),
      codes_departement: this.split(entry.codes_departement),
      codes_region: this.split(entry.codes_region),
      echelle: Echelle[entry.echelle],
      url_source: entry.url_source,
      url_demande: entry.url_demande,
      est_gratuit: !!entry.est_gratuit,
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],
      VISIBLE_PROD: this.trueIfUndefinedOrNull(entry.VISIBLE_PROD),
    });

    const computed =
      this.partenaireUsecase.external_compute_communes_departement_regions_from_liste_partenaires(
        result.partenaires_supp_ids,
      );

    result.codes_commune_from_partenaire = computed.codes_commune;
    result.codes_departement_from_partenaire = computed.codes_departement;
    result.codes_region_from_partenaire = computed.codes_region;

    return result;
  }

  private buildConformiteFromCMSData(
    entry: CMSWebhookEntryAPI,
  ): ConformiteDefinition {
    return {
      content_id: entry.id.toString(),
      titre: entry.Titre,
      contenu: entry.contenu,
      code: entry.code,
    };
  }

  /**
   * FIXME: this function should be factorized with the equivalent one in the
   * cms.import.usecase.ts to avoid code duplication, and therefore,
   * desynchronization.
   *
   * @note for the moment, only some fields have been factorized with {@link ActionCMSDataHelper}
   **/
  private buildActionFromCMSData(entry: CMSWebhookEntryAPI): ActionDefinition {
    return new ActionDefinition({
      cms_id: entry.id.toString(),
      partenaire_id: entry.partenaire ? '' + entry.partenaire.id : null,
      titre: entry.titre,
      titre_recherche: ActionCMSDataHelper.getTitreRcherche(entry.titre),
      sous_titre: entry.sous_titre,
      consigne: ActionCMSDataHelper.getConsigne(entry.consigne),
      label_compteur: ActionCMSDataHelper.getLabelCompteur(
        entry.label_compteur,
      ),
      pourquoi: entry.pourquoi,
      comment: entry.comment,
      quizz_felicitations: entry.felicitations,
      lvo_action: entry.action_lvo
        ? CategorieRecherche[entry.action_lvo]
        : null,
      lvo_objet: entry.objet_lvo
        ? SousCategorieRecherche[entry.objet_lvo]
        : null,
      type: TypeAction[entry.type_action],
      besoins: entry.besoins ? entry.besoins.map((elem) => elem.code) : [],
      quizz_ids: entry.quizzes
        ? entry.quizzes.map((elem) => elem.id.toString())
        : [],
      article_ids: entry.articles
        ? entry.articles.map((elem) => elem.id.toString())
        : [],
      faq_ids: entry.faqs ? entry.faqs.map((elem) => elem.id.toString()) : [],
      kyc_codes: entry.kycs ? entry.kycs.map((elem) => elem.code) : [],
      recette_categorie: entry.categorie_recettes
        ? CategorieRecherche[entry.categorie_recettes]
        : null,
      recette_sous_categorie: entry.sous_categorie_recettes
        ? SousCategorieRecherche[entry.sous_categorie_recettes]
        : null,
      pdcn_categorie: entry.categorie_pdcn
        ? CategorieRecherche[entry.categorie_pdcn]
        : null,
      thematique: entry.thematique ? Thematique[entry.thematique.code] : null,
      code: entry.code,
      sources: ActionCMSDataHelper.getSources(entry.sources),
      tags_a_exclure: entry.tag_v2_excluants
        ? entry.tag_v2_excluants.map((elem) => elem.code)
        : [],
      selections: entry.selections
        ? entry.selections.map((elem) => elem.code)
        : [],
      tags_a_inclure: entry.tag_v2_incluants
        ? entry.tag_v2_incluants.map((elem) => elem.code)
        : [],
      VISIBLE_PROD: this.trueIfUndefinedOrNull(entry.VISIBLE_PROD),
      emoji: entry.emoji,
      external_id: entry.external_id,
    });
  }

  private buildPartenaireFromCMSData(
    entry: CMSWebhookEntryAPI,
  ): PartenaireDefinition {
    const result = {
      id_cms: entry.id.toString(),
      nom: entry.nom,
      url: entry.lien,
      image_url: this.getImageUrlFromImageField(entry.logo[0]),
      echelle: Echelle[entry.echelle],
      code_commune: entry.code_commune,
      code_departement: entry.code_departement,
      code_region: entry.code_region,
      code_epci: entry.code_epci,
      liste_codes_commune_from_EPCI:
        this.partenaireUsecase.external_compute_communes_from_epci(
          entry.code_epci,
        ),
    };

    return result;
  }

  private buildFAQFromCMSData(entry: CMSWebhookEntryAPI): FAQDefinition {
    return {
      cms_id: entry.id.toString(),
      question: entry.question,
      reponse: entry.reponse,
      thematique: entry.thematique
        ? Thematique[entry.thematique.code]
        : Thematique.climat,
    };
  }

  private buildBlockTexteFromCMSData(
    entry: CMSWebhookEntryAPI,
  ): BlockTextDefinition {
    return {
      cms_id: entry.id.toString(),
      code: entry.code,
      titre: entry.titre,
      texte: entry.texte,
    };
  }

  private buildTagFromCMSData(entry: CMSWebhookEntryAPI): TagDefinition {
    return {
      cms_id: entry.id.toString(),
      tag: entry.code,
      description: entry.description,
      boost: entry.boost_absolu,
      ponderation: entry.ponderation,
      label_explication: entry.label_explication,
    };
  }

  private buildSelectionFromCMSData(
    entry: CMSWebhookEntryAPI,
  ): SelectionDefinition {
    return {
      cms_id: entry.id.toString(),
      code: entry.code,
      description: entry.description,
      titre: entry.titre,
      image_url: this.getImageUrlFromImageField(entry.imageUrl),
    };
  }

  private buildKycFromCMSData(entry: CMSWebhookEntryAPI): KycDefinition {
    return {
      id_cms: entry.id,
      code: entry.code,
      categorie: Categorie[entry.categorie],
      type: TypeReponseQuestionKYC[entry.type],
      is_ngc: entry.is_ngc,
      a_supprimer: !!entry.A_SUPPRIMER,
      ngc_key: entry.ngc_key,
      points: entry.points,
      emoji: entry.emoji,
      unite: parseUnite(entry.unite),
      question: entry.question,
      sous_titre: entry.sous_titre,
      thematique: entry.thematique
        ? Thematique[entry.thematique.code]
        : Thematique.climat,
      reponses: entry.reponses
        ? entry.reponses.map((r) => ({
            label: r.reponse,
            code: r.code,
            ngc_code: r.ngc_code,
            value: r.reponse,
          }))
        : [],
      tags: entry.tags
        ? entry.tags.map(
            (elem) => TagUtilisateur[elem.code] || TagUtilisateur.UNKNOWN,
          )
        : [],
      image_url: this.getImageUrlFromImageField(entry.imageUrl),
      short_question: entry.short_question,
      conditions: entry.OR_Conditions
        ? entry.OR_Conditions.map((or) =>
            or.AND_Conditions.map((and) => ({
              code_kyc: and.kyc.code,
              id_kyc: and.kyc.id,
              code_reponse: and.code_reponse,
            })),
          )
        : [],
    };
  }

  private getTitresFromRubriques(rubriques: CMSWebhookRubriqueAPI[]): string[] {
    if (rubriques) {
      return rubriques.map((rubrique) => rubrique.titre);
    }
    return [];
  }
  private getIdsFromRubriques(rubriques: CMSWebhookRubriqueAPI[]): string[] {
    if (rubriques) {
      return rubriques.map((rubrique) => rubrique.id.toString());
    }
    return [];
  }

  private split(list: string) {
    return list ? list.split(',').map((c) => c.trim()) : [];
  }

  private trueIfUndefinedOrNull(value: boolean) {
    if (value === undefined || value === null) return true;
    return value;
  }
}
