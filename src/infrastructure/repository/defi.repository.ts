import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Defi as DefiDB } from '@prisma/client';
import { Thematique } from '../../domain/contenu/thematique';
import { Tag } from '../../../src/domain/scoring/tag';
import { DefiDefinition } from '../../../src/domain/defis/defiDefinition';

@Injectable()
export class DefiRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(defi: DefiDefinition): Promise<void> {
    const defi_db = {
      content_id: defi.content_id,
      astuces: defi.astuces,
      pourquoi: defi.pourquoi,
      points: defi.points,
      titre: defi.titre,
      sous_titre: defi.sous_titre,
      tags: defi.tags,
      thematique: defi.thematique,
    };
    await this.prisma.defi.upsert({
      where: { content_id: defi.content_id },
      create: {
        ...defi_db,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        ...defi_db,
        updated_at: undefined,
      },
    });
  }
  async delete(content_id: string): Promise<void> {
    await this.prisma.defi.delete({
      where: { content_id: content_id },
    });
  }

  async getByContentId(content_id: string): Promise<DefiDefinition> {
    const result = await this.prisma.defi.findUnique({
      where: { content_id: content_id },
    });
    return this.buildDefiFromDB(result);
  }

  async list(): Promise<DefiDefinition[]> {
    const result = await this.prisma.defi.findMany();
    return result.map((elem) => this.buildDefiFromDB(elem));
  }

  private buildDefiFromDB(defiDB: DefiDB): DefiDefinition {
    if (defiDB === null) return null;
    return new DefiDefinition({
      content_id: defiDB.content_id,
      titre: defiDB.titre,
      sous_titre: defiDB.sous_titre,
      points: defiDB.points,
      tags: defiDB.tags.map((t) => Tag[t]),
      thematique: Thematique[defiDB.thematique],
      astuces: defiDB.astuces,
      pourquoi: defiDB.pourquoi,
    });
  }
}