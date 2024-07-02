import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KYC } from '@prisma/client';
import { KycDefinition } from '../../../src/domain/kyc/kycDefinition';
import { TypeReponseQuestionKYC } from '../../domain/kyc/questionKYC';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { Tag } from '../../../src/domain/scoring/tag';
import { Categorie } from '../../../src/domain/contenu/categorie';

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
      ngc_key: kycDef.ngc_key,
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

  async getByCode(code: string): Promise<KycDefinition> {
    const result = await this.prisma.kYC.findUnique({
      where: { code: code.toString() },
    });
    return this.buildKYCDefFromDB(result);
  }

  async getAllDefs(): Promise<KycDefinition[]> {
    const result = await this.prisma.kYC.findMany();
    return result.map((elem) => this.buildKYCDefFromDB(elem));
  }

  private buildKYCDefFromDB(kycDB: KYC): KycDefinition {
    if (kycDB === null) return null;
    return new KycDefinition({
      id_cms: kycDB.id_cms,
      code: kycDB.code,
      type: TypeReponseQuestionKYC[kycDB.type],
      categorie: Categorie[kycDB.categorie],
      points: kycDB.points,
      is_ngc: kycDB.is_ngc,
      question: kycDB.question,
      reponses: kycDB.reponses as any,
      thematique: Thematique[kycDB.thematique],
      tags: kycDB.tags ? kycDB.tags.map((t) => Tag[t]) : [],
      universes: kycDB.universes ? kycDB.universes : [],
      ngc_key: kycDB.ngc_key,
    });
  }
}
