import { Injectable } from '@nestjs/common';
import { CMSWebhookAPI } from '../infrastructure/api/types/cms/CMSWebhookAPI';
import { Thematique } from '../domain/contenu/thematique';
import { CMSEvent } from '../infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../infrastructure/api/types/cms/CMSModels';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import {
  CMSWebhookEntryAPI,
  CMSWebhookRubriqueAPI,
} from '../infrastructure/api/types/cms/CMSWebhookEntryAPI';
import { ArticleData } from '../domain/contenu/article';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { QuizzData } from '../domain/contenu/quizz';
import { Aide } from '../domain/aides/aide';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { DefiRepository } from '../infrastructure/repository/defi.repository';
import { DefiDefinition } from '../domain/defis/defiDefinition';
import { TagUtilisateur } from '../domain/scoring/tagUtilisateur';
import { Besoin } from '../domain/aides/besoin';
import {
  MissionDefinition,
  ObjectifDefinition,
} from '../domain/mission/missionDefinition';
import { ContentType } from '../domain/contenu/contentType';
import { MissionRepository } from '../infrastructure/repository/mission.repository';
import { KycDefinition } from '../domain/kyc/kycDefinition';
import { TypeReponseQuestionKYC, Unite } from '../domain/kyc/questionKYC';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { Categorie } from '../domain/contenu/categorie';

@Injectable()
export class CMSWebhookUsecase {
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
      this.buildAideFromCMSData(cmsWebhookAPI.entry),
    );
  }
  async createOrUpdateDefi(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.defiRepository.upsert(
      this.buildDefiFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async createOrUpdateThematique(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.thematiqueRepository.upsert({
      id_cms: cmsWebhookAPI.entry.id,
      titre: cmsWebhookAPI.entry.titre,
      code: cmsWebhookAPI.entry.code,
      emoji: cmsWebhookAPI.entry.emoji,
      image_url: this.getImageUrl(cmsWebhookAPI.entry),
      label: cmsWebhookAPI.entry.label,
    });
  }

  async createOrUpdateKyc(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.kycRepository.upsert(
      this.buildKycFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async createOrUpdateMission(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    await this.missionRepository.upsert(
      this.buildMissionFromCMSData(cmsWebhookAPI.entry),
    );
  }

  async deleteKyc(cmsWebhookAPI: CMSWebhookAPI) {
    await this.kycRepository.delete(cmsWebhookAPI.entry.id);
  }
  async deleteMission(cmsWebhookAPI: CMSWebhookAPI) {
    await this.missionRepository.delete(cmsWebhookAPI.entry.id);
  }

  private getImageUrl(cmsWebhookEntryAPI: CMSWebhookEntryAPI) {
    let url = null;
    if (cmsWebhookEntryAPI.imageUrl) {
      if (cmsWebhookEntryAPI.imageUrl.formats.thumbnail) {
        url = cmsWebhookEntryAPI.imageUrl.formats.thumbnail.url;
      } else {
        url = cmsWebhookEntryAPI.imageUrl.url;
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
        this.buildArticleOrQuizzFromCMSData(
          cmsWebhookAPI,
          CMSModel.article,
        ) as ArticleData,
      );
    }
    if (cmsWebhookAPI.model === CMSModel.quizz) {
      await this.quizzRepository.upsert(
        this.buildArticleOrQuizzFromCMSData(cmsWebhookAPI, CMSModel.quizz),
      );
    }
  }

  private buildArticleOrQuizzFromCMSData(
    hook: CMSWebhookAPI,
    type: CMSModel,
  ): ArticleData | QuizzData {
    const result = {
      content_id: hook.entry.id.toString(),
      tags_utilisateur: [],
      titre: hook.entry.titre,
      soustitre: hook.entry.sousTitre,
      source: hook.entry.source,
      image_url: this.getImageUrl(hook.entry),
      partenaire: hook.entry.partenaire ? hook.entry.partenaire.nom : null,
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
      score: 0,
      tags_rubriques: [],
      categorie: Categorie[hook.entry.categorie],
      mois: hook.entry.mois
        ? hook.entry.mois.split(',').map((m) => parseInt(m))
        : [],
    };
    if (type === CMSModel.article) {
      Object.assign(result, {
        include_codes_commune: this.split(hook.entry.include_codes_commune),
        exclude_codes_commune: this.split(hook.entry.exclude_codes_commune),
        codes_departement: this.split(hook.entry.codes_departement),
        codes_region: this.split(hook.entry.codes_region),
        tag_article: hook.entry.tag_article
          ? hook.entry.tag_article.code
          : null,
      });
    }
    return result;
  }

  private buildAideFromCMSData(entry: CMSWebhookEntryAPI): Aide {
    return {
      content_id: entry.id.toString(),
      titre: entry.titre,
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
      besoin: entry.besoin ? Besoin[entry.besoin.code] : null,
      besoin_desc: entry.besoin ? entry.besoin.description : null,
      include_codes_commune: this.split(entry.include_codes_commune),
      exclude_codes_commune: this.split(entry.exclude_codes_commune),
      codes_departement: this.split(entry.codes_departement),
      codes_region: this.split(entry.codes_region),
      echelle: entry.echelle,
      url_source: entry.url_source,
      url_demande: entry.url_demande,
    };
  }

  private buildDefiFromCMSData(entry: CMSWebhookEntryAPI): DefiDefinition {
    return {
      content_id: entry.id.toString(),
      titre: entry.titre,
      thematique: entry.thematique
        ? Thematique[entry.thematique.code]
        : Thematique.climat,
      astuces: entry.astuces,
      points: entry.points,
      pourquoi: entry.pourquoi,
      sous_titre: entry.sousTitre,
      tags: entry.tags
        ? entry.tags.map(
            (elem) => TagUtilisateur[elem.code] || TagUtilisateur.UNKNOWN,
          )
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
          id_kyc: and.kyc.id,
          code_reponse: and.code_reponse,
        })),
      ),
      impact_kg_co2: entry.impact_kg_co2,
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
      unite: this.extractUnite(entry.unite),
      question: entry.question,
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
      thematiques: entry.univers
        ? entry.univers.map((u) => Thematique[u.code])
        : [],
      image_url: this.getImageUrl(entry),
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

  private extractUnite(label_unite: string) {
    if (!label_unite) return null;
    const unite = Unite[label_unite.substring(0, label_unite.indexOf(' '))];
    return unite ? unite : null;
  }

  private buildMissionFromCMSData(
    entry: CMSWebhookEntryAPI,
  ): MissionDefinition {
    return {
      id_cms: entry.id,
      est_visible: entry.est_visible,
      thematique: entry.thematique
        ? Thematique[entry.thematique.code]
        : Thematique.climat,
      titre: entry.titre,
      code: entry.code,
      image_url: this.getImageUrl(entry),
      is_first: entry.is_first,
      objectifs:
        entry.objectifs.length > 0
          ? entry.objectifs.map((obj) => {
              const result = new ObjectifDefinition({
                titre: obj.titre,
                content_id: null,
                points: obj.points,
                type: null,
                tag_article: null,
                id_cms: null,
              });
              if (obj.article) {
                result.type = ContentType.article;
                result.content_id = obj.article.id.toString();
                result.id_cms = obj.article.id;
              }
              if (obj.tag_article) {
                result.type = ContentType.article;
                result.tag_article = obj.tag_article.code;
              }
              if (obj.defi) {
                result.type = ContentType.defi;
                result.content_id = obj.defi.id.toString();
                result.id_cms = obj.defi.id;
              }
              if (obj.quizz) {
                result.type = ContentType.quizz;
                result.content_id = obj.quizz.id.toString();
                result.id_cms = obj.quizz.id;
              }
              if (obj.kyc) {
                result.type = ContentType.kyc;
                result.content_id = obj.kyc.code;
                result.id_cms = obj.kyc.id;
              }
              if (obj.mosaic) {
                result.type = ContentType.mosaic;
                result.content_id = obj.mosaic.code;
                result.id_cms = obj.mosaic.id;
              }
              return result;
            })
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
}
