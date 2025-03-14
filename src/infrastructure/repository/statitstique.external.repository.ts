import { Injectable } from '@nestjs/common';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../domain/kyc/questionKYC';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { PrismaServiceStat } from '../prisma/stats/prisma.service.stats';

@Injectable()
export class StatistiqueExternalRepository {
  constructor(private prismaStats: PrismaServiceStat) {}

  public async deleteAllUserData() {
    await this.prismaStats.utilisateurCopy.deleteMany();
  }
  public async deleteAllKYCData() {
    await this.prismaStats.kYCCopy.deleteMany();
  }

  public async createUserData(utilisateur: Utilisateur) {
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
}
