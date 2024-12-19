import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ConformiteDefinition } from '../../domain/contenu/conformiteDefinition';
import { Conformite } from '@prisma/client';

@Injectable()
export class ConformiteRepository {
  private static catalogue_conformite_by_code: Map<
    string,
    ConformiteDefinition
  >;

  constructor(private prisma: PrismaService) {
    ConformiteRepository.catalogue_conformite_by_code = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadConformite();
    } catch (error) {
      console.error(
        `Error loading conformite definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  public static getByCode(code: string): ConformiteDefinition {
    return ConformiteRepository.catalogue_conformite_by_code.get(code);
  }

  public static resetCache() {
    // FOR TEST ONLY
    ConformiteRepository.catalogue_conformite_by_code = new Map();
  }

  @Cron('* * * * *')
  public async loadConformite() {
    const new_map: Map<string, ConformiteDefinition> = new Map();
    const listeConfo = await this.prisma.conformite.findMany();
    for (const confo of listeConfo) {
      new_map.set(confo.code, {
        content_id: confo.id_cms,
        titre: confo.titre,
        contenu: confo.contenu,
        code: confo.code,
      });
    }
    ConformiteRepository.catalogue_conformite_by_code = new_map;
  }

  public async upsert(confo_def: ConformiteDefinition) {
    const data: Conformite = {
      titre: confo_def.titre,
      contenu: confo_def.contenu,
      id_cms: confo_def.content_id,
      code: confo_def.code,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.conformite.upsert({
      where: {
        id_cms: data.id_cms,
      },
      create: data,
      update: data,
    });
  }

  public async delete(id_cms: string) {
    await this.prisma.conformite.delete({
      where: {
        id_cms: id_cms,
      },
    });
  }
}
