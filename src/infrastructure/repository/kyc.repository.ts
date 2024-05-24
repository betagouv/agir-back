import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KYC } from '@prisma/client';
import { Univers } from '../../domain/univers/univers';
import { KycDefinition } from '../../../src/domain/kyc/kycDefinition';
import {
  CategorieQuestionKYC,
  KYCID,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { Tag } from '../../../src/domain/scoring/tag';

@Injectable()
export class KycRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(kycDef: KycDefinition): Promise<void> {
    const kycDB: KYC = {
      id_cms: kycDef.id_cms,
      code: kycDef.code,
      type: kycDef.type,
      categorie: kycDef.categorie,
      points: kycDef.points,
      is_ngc: kycDef.is_ngc,
      question: kycDef.question,
      reponses: kycDef.reponses,
      thematique: kycDef.thematique ? kycDef.thematique.toString() : null,
      tags: kycDef.tags.map((t) => t.toString()),
      universes: kycDef.universes.map((u) => u.toString()),
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.kYC.upsert({
      where: { id_cms: kycDef.id_cms },
      create: {
        ...kycDB,
      },
      update: {
        ...kycDB,
      },
    });
  }
  async delete(content_id: number): Promise<void> {
    await this.prisma.kYC.delete({
      where: { id_cms: content_id },
    });
  }

  async getByCode(code: KYCID): Promise<KycDefinition> {
    const result = await this.prisma.kYC.findUnique({
      where: { code: code.toString() },
    });
    return this.buildKYCDefFromDB(result);
  }

  async getAll(): Promise<QuestionKYC[]> {
    const result = await this.prisma.kYC.findMany();
    return result.map((elem) => this.buildKYCFromDB(elem));
  }
  async getAllDefs(): Promise<KycDefinition[]> {
    const result = await this.prisma.kYC.findMany();
    return result.map((elem) => this.buildKYCDefFromDB(elem));
  }

  private buildKYCFromDB(kycDB: KYC): QuestionKYC {
    if (kycDB === null) return null;
    return new QuestionKYC({
      categorie: CategorieQuestionKYC[kycDB.categorie],
      id: KYCID[kycDB.code],
      is_NGC: kycDB.is_ngc,
      points: kycDB.points,
      tags: kycDB.tags ? kycDB.tags.map((t) => Tag[t]) : [],
      type: TypeReponseQuestionKYC[kycDB.type],
      ngc_key: null,
      thematique: Thematique[kycDB.thematique],
      universes: kycDB.universes ? kycDB.universes.map((u) => Univers[u]) : [],
      question: kycDB.question,
      reponses_possibles: kycDB.reponses
        ? (kycDB.reponses as { label: string; code: string }[]).map((r) => ({
            code: r.code,
            label: r.label,
          }))
        : [],
    });
  }

  private buildKYCDefFromDB(kycDB: KYC): KycDefinition {
    if (kycDB === null) return null;
    return new KycDefinition({
      id_cms: kycDB.id_cms,
      code: KYCID[kycDB.code],
      type: TypeReponseQuestionKYC[kycDB.type],
      categorie: CategorieQuestionKYC[kycDB.categorie],
      points: kycDB.points,
      is_ngc: kycDB.is_ngc,
      question: kycDB.question,
      reponses: kycDB.reponses as any,
      thematique: Thematique[kycDB.thematique],
      tags: kycDB.tags ? kycDB.tags.map((t) => Tag[t]) : [],
      universes: kycDB.universes ? kycDB.universes.map((u) => Univers[u]) : [],
    });
  }
}
