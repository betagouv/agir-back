import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Thematique } from '../../domain/contenu/thematique';
import { CMSThematiqueAPI } from '../api/types/cms/CMSThematiqueAPI';

@Injectable()
export class ThematiqueRepository {
  static titres_thematiques: Map<Thematique, string>;

  constructor(private prisma: PrismaService) {
    ThematiqueRepository.titres_thematiques = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.FIRST_START !== 'true') {
      await this.loadThematiques();
    }
  }

  public static getLibelleThematique(thematique: Thematique): string {
    const libelle = ThematiqueRepository.titres_thematiques.get(thematique);
    return libelle || thematique.toString();
  }

  public static resetThematiques() {
    // FOR TEST ONLY
    ThematiqueRepository.titres_thematiques = new Map();
  }

  public async loadThematiques() {
    const listeThematiques = await this.prisma.thematique.findMany();
    listeThematiques.forEach((them) => {
      this.setTitreOfThematiqueByCmsId(them.id_cms, them.titre);
    });
  }

  public async upsertThematique(id_cms: number, titre: string) {
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
    ThematiqueRepository.titres_thematiques.set(
      CMSThematiqueAPI.getThematiqueByCmsId(cms_id),
      titre,
    );
  }
}
