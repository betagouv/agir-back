import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { KYC } from '@prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KycDefinition } from '../../../src/domain/kyc/kycDefinition';
import { Tag } from '../../../src/domain/scoring/tag';
import { TypeReponseQuestionKYC } from '../../domain/kyc/questionKYC';
import { Thematique } from '../../domain/thematique/thematique';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KycRepository {
  constructor(private prisma: PrismaService) {
    KycRepository.catalogue_kyc = [];
    KycRepository.map_kyc = new Map();
  }

  private static catalogue_kyc: KycDefinition[];
  private static map_kyc: Map<string, KycDefinition>;

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading KYC definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  @Cron('* * * * *')
  async loadCache(): Promise<void> {
    const result = await this.prisma.kYC.findMany();
    const new_catalogue = [];
    const new_map = new Map();

    for (const element of result) {
      const def = this.buildKYCDefFromDB(element);
      new_catalogue.push(def);
      new_map.set(def.code, def);
    }

    KycRepository.catalogue_kyc = new_catalogue;
    KycRepository.map_kyc = new_map;
  }

  public static resetCache() {
    // FOR TEST ONLY
    KycRepository.catalogue_kyc = [];
  }

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
      image_url: kycDef.image_url,
      short_question: kycDef.short_question,
      conditions: kycDef.conditions as any,
      unite: kycDef.unite,
      emoji: kycDef.emoji,
      a_supprimer: kycDef.a_supprimer,
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

  async getByCMS_ID(cms_id: number): Promise<KycDefinition> {
    const result = await this.prisma.kYC.findUnique({
      where: { id_cms: cms_id },
    });
    return this.buildKYCDefFromDB(result);
  }

  getByCode(kyc_code: string): KycDefinition {
    return KycRepository.map_kyc.get(kyc_code);
  }

  public static getCatalogue(): KycDefinition[] {
    return KycRepository.catalogue_kyc;
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
      tags: kycDB.tags ? kycDB.tags.map((t) => Tag[t]).filter((e) => !!e) : [],
      ngc_key: kycDB.ngc_key,
      short_question: kycDB.short_question,
      image_url: kycDB.image_url,
      conditions: kycDB.conditions as any,
      unite: kycDB.unite
        ? {
            abreviation: kycDB.unite['abreviation'],
            long: kycDB.unite['long'],
          }
        : undefined,
      emoji: kycDB.emoji,
      a_supprimer: kycDB.a_supprimer,
    });
  }

  private get;
}
