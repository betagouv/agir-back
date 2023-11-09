import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Thematique } from '../../../src/domain/thematique';
import { CMSThematiqueAPI } from '../api/types/cms/CMSThematiqueAPI';

@Injectable()
export class ThematiqueRepository {
  titres_thematiques: Map<Thematique, string>;
  constructor(private prisma: PrismaService) {
    this.titres_thematiques = new Map();
  }

  public getLibelleThematique(thematique: Thematique): string {
    return this.titres_thematiques.get(thematique);
  }

  public async loadThematiques() {
    const listeThematiques = await this.prisma.thematique.findMany();
    listeThematiques.forEach((them) => {
      this.setTitreOfThematiqueByCmsId(them.id_cms, them.titre);
    });
  }

  public async upsertThematique(id_cms: number, titre: string) {
    this.setTitreOfThematiqueByCmsId(id_cms, titre);
    await this.prisma.thematique.upsert({
      where: {
        id_cms: id_cms,
      },
      create: {
        id: uuidv4(),
        id_cms: id_cms,
        titre: titre,
      },
      update: {
        titre: titre,
      },
    });
  }

  private setTitreOfThematiqueByCmsId(cms_id: number, titre: string) {
    this.titres_thematiques.set(
      CMSThematiqueAPI.getThematiqueByCmsId(cms_id),
      titre,
    );
  }
}
