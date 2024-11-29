import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Thematique } from '../../domain/contenu/thematique';
import { Cron } from '@nestjs/schedule';
import { ThematiqueDefinition } from '../../domain/thematique/thematiqueDefinition';

@Injectable()
export class ThematiqueRepository {
  private static catalogue_thematiques_by_thematiques: Map<
    Thematique,
    ThematiqueDefinition
  >;

  constructor(private prisma: PrismaService) {
    ThematiqueRepository.catalogue_thematiques_by_thematiques = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadThematiques();
    } catch (error) {
      console.error(
        `Error loading thematiques definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  public static getLibelleThematique(thematique: Thematique): string {
    const def =
      ThematiqueRepository.catalogue_thematiques_by_thematiques.get(thematique);
    return def ? def.label : thematique.toString();
  }

  public static resetAllRefs() {
    // FOR TEST ONLY
    ThematiqueRepository.catalogue_thematiques_by_thematiques = new Map();
  }

  @Cron('* * * * *')
  public async loadThematiques() {
    const new_map: Map<Thematique, ThematiqueDefinition> = new Map();
    const listeThematiques = await this.prisma.thematique.findMany();
    for (const them of listeThematiques) {
      new_map.set(Thematique[them.code], {
        id_cms: them.id_cms,
        code: them.code,
        emoji: them.emoji,
        image_url: them.image_url,
        label: them.label,
        titre: them.titre,
      });
    }
    ThematiqueRepository.catalogue_thematiques_by_thematiques = new_map;
  }

  public static getAllThematiques(): Thematique[] {
    return Object.values(Thematique);
  }

  static getTitreThematique(thematique: Thematique) {
    const def =
      ThematiqueRepository.catalogue_thematiques_by_thematiques.get(thematique);
    return def ? def.titre : thematique.toString();
  }
  static getLabelThematique(thematique: Thematique) {
    const def =
      ThematiqueRepository.catalogue_thematiques_by_thematiques.get(thematique);
    return def ? def.label : thematique.toString();
  }

  public static getThematiqueDefinition(thematique: Thematique) {
    return ThematiqueRepository.catalogue_thematiques_by_thematiques.get(
      thematique,
    );
  }

  public async upsert(thematique_def: ThematiqueDefinition) {
    const data = {
      titre: thematique_def.titre,
      code: thematique_def.code,
      emoji: thematique_def.emoji,
      image_url: thematique_def.image_url,
      label: thematique_def.label,
    };
    await this.prisma.thematique.upsert({
      where: {
        id_cms: thematique_def.id_cms,
      },
      create: {
        id_cms: thematique_def.id_cms,
        ...data,
      },
      update: data,
    });
  }
}
