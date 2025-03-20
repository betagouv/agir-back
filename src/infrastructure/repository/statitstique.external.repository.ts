import { Injectable } from '@nestjs/common';
import { Action } from '../../domain/actions/action';
import { Aide } from '../../domain/aides/aide';
import { Article } from '../../domain/contenu/article';
import { Quizz } from '../../domain/contenu/quizz';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../domain/kyc/questionKYC';
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

  public async createUserData(utilisateur: Utilisateur) {
    const code_depart =
      this.communeRepository.findDepartementRegionByCodeCommune(
        utilisateur.code_commune,
      );
    await this.prismaStats.utilisateurCopy.create({
      data: {
        user_id: utilisateur.external_stat_id,

        code_insee_commune: utilisateur.code_commune,
        code_postal: utilisateur.logement.code_postal,
        nom_commune: utilisateur.logement.commune,

        nombre_points: utilisateur.gamification.getPoints(),

        nombre_parts_fiscales: utilisateur.parts,
        revenu_fiscal: utilisateur.revenu_fiscal,

        source_inscription: utilisateur.source_inscription,
        compte_actif: utilisateur.active_account,
        date_derniere_activite: utilisateur.derniere_activite,
        code_departement: code_depart.code_departement,
        rang_commune: utilisateur.rank_commune,
        rang_national: utilisateur.rank,
      },
    });
  }

  public async createActionData(user_id: string, action: Action) {
    await this.prismaStats.actionCopy.create({
      data: {
        user_id: user_id,
        cms_id: action.cms_id,
        code_action: action.code,
        type_code_id: action.getTypeCodeId(),
        thematique: action.thematique,
        titre: action.titre,
        type_action: action.type,
        faite_le: action.faite_le,
        vue_le: action.vue_le,
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
      reponse.reponse_unique_code = kyc.getCodeReponseQuestionChoixUnique();
    }
    if (kyc.type === TypeReponseQuestionKYC.choix_multiple) {
      reponse.reponse_multiple_code = kyc.getSelectedCodes();
    }
    if (kyc.type === TypeReponseQuestionKYC.libre) {
      reponse.reponse_texte = kyc.getReponseSimpleValue();
    }
    if (kyc.type === TypeReponseQuestionKYC.entier) {
      reponse.reponse_entier = kyc.getReponseSimpleValueAsNumber();
    }
    if (kyc.type === TypeReponseQuestionKYC.decimal) {
      reponse.reponse_decimal = kyc.getReponseSimpleValue();
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
      reponse.reponse_unique_code = kyc.getCodeReponseQuestionChoixUnique();
    }
    if (kyc.type === TypeReponseQuestionKYC.choix_multiple) {
      reponse.reponse_multiple_code = kyc.getSelectedCodes();
    }
    if (kyc.type === TypeReponseQuestionKYC.libre) {
      reponse.reponse_texte = kyc.getReponseSimpleValue();
    }
    if (kyc.type === TypeReponseQuestionKYC.entier) {
      reponse.reponse_entier = kyc.getReponseSimpleValueAsNumber();
    }
    if (kyc.type === TypeReponseQuestionKYC.decimal) {
      reponse.reponse_decimal = kyc.getReponseSimpleValue();
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
}
