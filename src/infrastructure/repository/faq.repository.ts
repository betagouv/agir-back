import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FAQ } from '@prisma/client';
import { FAQDefinition } from '../../domain/faq/FAQDefinition';
import { Thematique } from '../../domain/thematique/thematique';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FAQRepository {
  constructor(private prisma: PrismaService) {
    FAQRepository.catalogue = [];
  }

  private static catalogue: FAQDefinition[];

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadFAQ();
    } catch (error) {
      console.error(
        `Error loading FAQ definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }
  @Cron('* * * * *')
  async loadFAQ(): Promise<void> {
    const result = await this.prisma.fAQ.findMany();
    FAQRepository.catalogue = result.map((elem) =>
      this.buildFAQDefinitionFromDB(elem),
    );
  }

  public static resetCache() {
    // FOR TEST ONLY
    FAQRepository.catalogue = [];
  }

  public static getCatalogue(): FAQDefinition[] {
    return FAQRepository.catalogue;
  }

  async upsert(faq: FAQDefinition): Promise<void> {
    const faq_db: FAQ = {
      id_cms: faq.cms_id,
      question: faq.question,
      reponse: faq.reponse,
      thematique: faq.thematique,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.fAQ.upsert({
      where: {
        id_cms: faq.cms_id,
      },
      create: {
        ...faq_db,
      },
      update: {
        ...faq_db,
      },
    });
  }
  async delete(cms_id: string): Promise<void> {
    await this.prisma.fAQ.delete({
      where: {
        id_cms: cms_id,
      },
    });
  }

  private buildFAQDefinitionFromDB(faq: FAQ): FAQDefinition {
    if (faq === null) return null;
    return new FAQDefinition({
      cms_id: faq.id_cms,
      question: faq.question,
      reponse: faq.reponse,
      thematique: Thematique[faq.thematique],
    });
  }
}
