import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Action } from '../../domain/actions/action';
import { Aide } from '../../domain/aides/aide';
import { Bilan_OLD } from '../../domain/bilan/bilan_old';
import { Article } from '../../domain/contenu/article';
import { Quizz } from '../../domain/contenu/quizz';
import { QuestionChoixMultiple } from '../../domain/kyc/new_interfaces/QuestionChoixMultiples';
import { QuestionChoixUnique } from '../../domain/kyc/new_interfaces/QuestionChoixUnique';
import { QuestionNumerique } from '../../domain/kyc/new_interfaces/QuestionNumerique';
import { QuestionSimple } from '../../domain/kyc/new_interfaces/QuestionSimple';
import { QuestionTexteLibre } from '../../domain/kyc/new_interfaces/QuestionTexteLibre';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../domain/kyc/questionKYC';
import { CanalNotification } from '../../domain/notification/notificationHistory';
import { Thematique } from '../../domain/thematique/thematique';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { PrismaServiceStat } from '../prisma/stats/prisma.service.stats';
import { CommuneRepository } from './commune/commune.repository';

@Injectable()
export class StatistiqueExternalRepository {
  constructor(
    private prismaStats: PrismaServiceStat,
    private communeRepository: CommuneRepository,
  ) {}

  public async deleteAllUserData() {
    await this.prismaStats.utilisateurCopy.deleteMany();
  }
  public async deleteAllUserNotifData() {
    await this.prismaStats.notifications.deleteMany();
  }

  public async deleteAllUserVisiteData() {
    await this.prismaStats.visites.deleteMany();
  }
  public async deleteAllKYCData() {
    await this.prismaStats.kYCCopy.deleteMany();
  }
  public async deleteAllActionData() {
    await this.prismaStats.actionCopy.deleteMany();
  }
  public async deleteAllArticleData() {
    await this.prismaStats.articleCopy.deleteMany();
  }
  public async deleteAllAideData() {
    await this.prismaStats.aideCopy.deleteMany();
  }
  public async deleteAllQuizzData() {
    await this.prismaStats.quizzCopy.deleteMany();
  }
  public async deleteAllPersoData() {
    await this.prismaStats.personnalisation.deleteMany();
  }
  public async deleteAllQuestionData() {
    await this.prismaStats.questionsUtilisateur.deleteMany();
  }

  public async getNombreInscritsDernierMois(): Promise<number> {
    const last_month = new Date();
    last_month.setMonth(new Date().getMonth() - 1);

    return await this.prismaStats.utilisateurCopy.count({
      where: {
        date_inscription: {
          gt: last_month,
        },
      },
    });
  }

  public async createUserQuestionData(
    action_cms_id: string,
    action_titre: string,
    date_question: Date,
    est_action_faite: boolean,
    question: string,
    user_id: string,
  ) {
    await this.prismaStats.questionsUtilisateur.create({
      data: {
        id: uuidv4(),
        action_cms_id: action_cms_id,
        action_titre: action_titre,
        date_question: date_question,
        est_action_faite: est_action_faite,
        question: question,
        user_id: user_id,
      },
    });
  }

  public async createUserData(utilisateur: Utilisateur) {
    const code_depart =
      this.communeRepository.findDepartementRegionByCodeCommune(
        utilisateur.logement.code_commune,
      );
    await this.prismaStats.utilisateurCopy.create({
      data: {
        user_id: utilisateur.external_stat_id,

        code_insee_commune: utilisateur.logement.code_commune,
        code_postal: utilisateur.logement.code_postal,
        nom_commune: utilisateur.logement.commune,

        nombre_points: utilisateur.gamification.getPoints(),

        nombre_parts_fiscales: utilisateur.parts,
        revenu_fiscal: utilisateur.revenu_fiscal,

        source_inscription: utilisateur.source_inscription,
        compte_actif: utilisateur.active_account,
        date_derniere_activite: utilisateur.derniere_activite,
        code_departement: code_depart ? code_depart.code_departement : null,
        rang_commune: utilisateur.rank_commune,
        rang_national: utilisateur.rank,
        date_inscription: utilisateur.created_at,
        version_utilisateur: utilisateur.global_user_version,
        notifications_mobile_actives: !!utilisateur.mobile_token,
        notifications_email_actives:
          utilisateur.notification_history.isCanalEnabled(
            CanalNotification.email,
          ),
        urbain: this.communeRepository.getNiveauUrbainCommune(
          utilisateur.logement?.code_commune,
        ),
      },
    });
  }

  public async createUserNotificationData(data: {
    user_ext_id: string;
    type: string;
    canal: string;
    date: Date;
  }) {
    await this.prismaStats.notifications.create({
      data: {
        id: uuidv4(),
        user_id: data.user_ext_id,
        canal_notification: data.canal,
        type_notification: data.type,
        date_notification: data.date,
      },
    });
  }

  public async createUserVisiteData(user_ext_id: string, date: Date) {
    await this.prismaStats.visites.create({
      data: {
        id: uuidv4(),
        user_id: user_ext_id,
        heure_premiere_visite_du_jour: date,
      },
    });
  }

  public async createActionData(user_id: string, action: Action) {
    await this.prismaStats.actionCopy.create({
      data: {
        user_id: user_id,
        cms_id: action.cms_id,
        code_action: action.code,
        type_code_id: action.getTypeCodeAsString(),
        thematique: action.thematique,
        titre: action.titre,
        type_action: action.type,
        faite_le: action.faite_le,
        vue_le: action.vue_le,
        feedback: action.feedback,
        like_level: action.like_level,
        dates_partages: action.liste_partages,
      },
    });
  }
  public async createArticleData(user_id: string, article: Article) {
    await this.prismaStats.articleCopy.create({
      data: {
        user_id: user_id,
        cms_id: article.content_id,
        titre: article.titre,
        thematique: article.thematique_principale,
        lu_le: article.read_date,
        est_favoris: article.favoris,
        like_level: article.like_level,
        dates_partages: article.liste_partages,
      },
    });
  }
  public async createAideData(user_id: string, aide: Aide) {
    await this.prismaStats.aideCopy.create({
      data: {
        user_id: user_id,
        cms_id: aide.content_id,
        titre: aide.titre,
        thematiques: aide.thematiques,
        vue_le: aide.vue_at,
        clicked_infos: aide.clicked_infos,
        clicked_demande: aide.clicked_demande,
        est_connue_utilisateur: aide.est_connue_utilisateur,
        sera_sollicitee_utilisateur: aide.sera_sollicitee_utilisateur,
        feedback: aide.feedback,
        like_level: aide.like_level,
      },
    });
  }
  public async createQuizzData(user_id: string, quizz: Quizz) {
    await this.prismaStats.quizzCopy.create({
      data: {
        user_id: user_id,
        cms_id: quizz.content_id,
        titre: quizz.titre,
        thematique: quizz.thematique_principale,
        bon_premier_coup: quizz.premier_coup_ok,
        date_premier_coup: quizz.date_premier_coup,
        like_level: quizz.like_level,
        nombre_tentatives: quizz.nombre_tentatives,
      },
    });
  }

  public async createPersonnalisationData(utilisateur: Utilisateur) {
    const actions_rejetees_all = utilisateur.thematique_history
      .getAllActionsExclues()
      .map((a) => a.action.code);

    await this.prismaStats.personnalisation.create({
      data: {
        user_id: utilisateur.external_stat_id,
        tags: utilisateur.recommandation.getListeTagsActifs(),
        perso_alimentation_done_once:
          utilisateur.thematique_history.isPersonnalisationDoneOnce(
            Thematique.alimentation,
          ),
        perso_consommation_done_once:
          utilisateur.thematique_history.isPersonnalisationDoneOnce(
            Thematique.consommation,
          ),
        perso_logement_done_once:
          utilisateur.thematique_history.isPersonnalisationDoneOnce(
            Thematique.logement,
          ),
        perso_transport_done_once:
          utilisateur.thematique_history.isPersonnalisationDoneOnce(
            Thematique.transport,
          ),
        actions_rejetees_all: actions_rejetees_all,
      },
    });
  }

  public async createKYCData(user_id: string, kyc: QuestionKYC) {
    const reponse = {
      reponse_unique_code: undefined,
      reponse_multiple_code: undefined,
      reponse_entier: undefined,
      reponse_decimal: undefined,
      reponse_texte: undefined,
    };

    if (kyc.isMosaic()) return;

    if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
      reponse.reponse_unique_code = new QuestionChoixUnique(
        kyc,
      ).getSelectedCode();
    }
    if (kyc.type === TypeReponseQuestionKYC.choix_multiple) {
      reponse.reponse_multiple_code = new QuestionChoixMultiple(
        kyc,
      ).getSelectedCodes();
    }
    if (kyc.type === TypeReponseQuestionKYC.libre) {
      reponse.reponse_texte = new QuestionTexteLibre(kyc).getText();
    }
    if (kyc.type === TypeReponseQuestionKYC.entier) {
      reponse.reponse_entier = new QuestionNumerique(kyc).getValue();
    }
    if (kyc.type === TypeReponseQuestionKYC.decimal) {
      reponse.reponse_decimal = new QuestionSimple(kyc).getStringValue();
    }

    await this.prismaStats.kYCCopy.create({
      data: {
        user_id: user_id,
        cms_id: kyc.id_cms.toString(),
        code_kyc: kyc.code,
        question: kyc.question,
        thematique: kyc.thematique,
        derniere_mise_a_jour: kyc.last_update,
        type_question: kyc.type,
        ...reponse,
      },
    });
  }

  public async upsertKYCData(user_id: string, kyc: QuestionKYC) {
    const reponse = {
      reponse_unique_code: undefined,
      reponse_multiple_code: undefined,
      reponse_entier: undefined,
      reponse_decimal: undefined,
      reponse_texte: undefined,
    };

    if (kyc.isMosaic()) return;

    if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
      reponse.reponse_unique_code = new QuestionChoixUnique(
        kyc,
      ).getSelectedCode();
    }
    if (kyc.type === TypeReponseQuestionKYC.choix_multiple) {
      reponse.reponse_multiple_code = new QuestionChoixMultiple(
        kyc,
      ).getSelectedCodes();
    }
    if (kyc.type === TypeReponseQuestionKYC.libre) {
      reponse.reponse_texte = new QuestionTexteLibre(kyc).getText();
    }
    if (kyc.type === TypeReponseQuestionKYC.entier) {
      reponse.reponse_entier = new QuestionNumerique(kyc).getValue();
    }
    if (kyc.type === TypeReponseQuestionKYC.decimal) {
      reponse.reponse_decimal = new QuestionSimple(kyc).getStringValue();
    }

    await this.prismaStats.kYCCopy.upsert({
      where: {
        user_id_code_kyc: {
          user_id: user_id,
          code_kyc: kyc.code,
        },
      },

      create: {
        user_id: user_id,
        cms_id: kyc.id_cms.toString(),
        code_kyc: kyc.code,
        question: kyc.question,
        thematique: kyc.thematique,
        derniere_mise_a_jour: kyc.last_update,
        type_question: kyc.type,
        ...reponse,
      },
      update: {
        cms_id: kyc.id_cms.toString(),
        question: kyc.question,
        thematique: kyc.thematique,
        derniere_mise_a_jour: kyc.last_update,
        type_question: kyc.type,
        ...reponse,
      },
    });
  }

  public async upsertBilanCarbone(
    user_id: string,
    bilan: Bilan_OLD,
    pourcentages: {
      total: number;
      alimentation: number;
      transport: number;
      logement: number;
      consommation: number;
    },
  ) {
    const conso = pourcentages.consommation;
    const alim = pourcentages.alimentation;
    const trans = pourcentages.transport;
    const loge = pourcentages.logement;
    const total = pourcentages.total;

    const data = {
      total_kg: bilan.bilan_carbone_annuel,
      alimentation_kg: bilan.details.alimentation,
      consommation_kg: bilan.details.divers,
      logement_kg: bilan.details.logement,
      transport_kg: bilan.details.transport,
      pourcentage_progression_consommation: Number.isNaN(conso) ? 0 : conso,
      pourcentage_progression_logement: Number.isNaN(loge) ? 0 : loge,
      pourcentage_progression_alimentation: Number.isNaN(alim) ? 0 : alim,
      pourcentage_progression_transport: Number.isNaN(trans) ? 0 : trans,
      pourcentage_progression_total: Number.isNaN(total) ? 0 : total,
    };

    await this.prismaStats.bilanCarbone.upsert({
      where: {
        user_id: user_id,
      },

      create: {
        user_id: user_id,
        ...data,
      },
      update: {
        ...data,
      },
    });
  }

  public async getLastUpdateTime(user_id: string): Promise<Date> {
    const time = await this.prismaStats.bilanCarbone.findUnique({
      where: {
        user_id: user_id,
      },
      select: {
        updated_at: true,
      },
    });

    if (time) {
      return time.updated_at;
    }
    return null;
  }
}
