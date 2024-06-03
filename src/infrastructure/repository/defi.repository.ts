import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Defi, Defi as DefiDB } from '@prisma/client';
import { Thematique } from '../../domain/contenu/thematique';
import { Tag } from '../../../src/domain/scoring/tag';
import { DefiDefinition } from '../../../src/domain/defis/defiDefinition';
import { TuileThematique } from '../../domain/univers/tuileThematique';
import { Univers } from '../../../src/domain/univers/univers';
import { Categorie } from '../../../src/domain/contenu/categorie';

@Injectable()
export class DefiRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(defi: DefiDefinition): Promise<void> {
    const defi_db: Defi = {
      content_id: defi.content_id,
      astuces: defi.astuces,
      pourquoi: defi.pourquoi,
      points: defi.points,
      titre: defi.titre,
      sous_titre: defi.sous_titre,
      tags: defi.tags,
      thematique: defi.thematique,
      universes: defi.universes,
      thematiquesUnivers: defi.thematiques_univers,
      categorie: defi.categorie,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.defi.upsert({
      where: { content_id: defi.content_id },
      create: {
        ...defi_db,
      },
      update: {
        ...defi_db,
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
      universes: defiDB.universes.map((u) => Univers[u]),
      thematiques_univers: defiDB.thematiquesUnivers.map(
        (t) => TuileThematique[t],
      ),
      categorie: Categorie[defiDB.categorie],
    });
  }
}
