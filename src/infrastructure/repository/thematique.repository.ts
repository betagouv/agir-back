import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Thematique } from '../../domain/contenu/thematique';
import { App } from '../../../src/domain/app';
import { TuileUnivers } from '../../domain/univers/tuileUnivers';
import { TuileThematique } from '../../../src/domain/univers/tuileThematique';
import { Cron } from '@nestjs/schedule';
import { UniversDefinition } from '../../../src/domain/univers/universDefinition';
import { ThematiqueDefinition } from '../../../src/domain/univers/thematiqueDefinition';
import { UniversExtraLabels } from '../../domain/univers/universExtraLabels';

@Injectable()
export class ThematiqueRepository {
  static titres_thematiques: Map<Thematique, string>;
  static univers: Map<string, TuileUnivers>;
  static thematiquesUnivers: Map<string, TuileThematique>;

  constructor(private prisma: PrismaService) {
    ThematiqueRepository.titres_thematiques = new Map();
    ThematiqueRepository.univers = new Map();
    ThematiqueRepository.thematiquesUnivers = new Map();
  }
  async onApplicationBootstrap(): Promise<void> {
    if (!App.isFirstStart()) {
      await this.loadThematiques();
      await this.loadUnivers();
      await this.loadThematiqueUnivers();
    }
  }

  @Cron('* * * * *')
  async loadCachedData(): Promise<void> {
    if (!App.areCachedUnivers()) {
      await this.onApplicationBootstrap();
    }
  }

  public static getLibelleThematique(thematique: Thematique): string {
    const libelle = ThematiqueRepository.titres_thematiques.get(thematique);
    return libelle || thematique.toString();
  }

  public static getTuileUnivers(type: string): TuileUnivers {
    return ThematiqueRepository.univers.get(type);
  }
  public static getTuileThematique(type: string): TuileThematique {
    return ThematiqueRepository.thematiquesUnivers.get(type);
  }
  public static getUniversParent(thematiqueUnivers: string): string {
    const tuile = ThematiqueRepository.getTuileThematique(thematiqueUnivers);
    return tuile ? tuile.univers_parent : undefined;
  }

  public static getAllTuilesThematique(univers: string): TuileThematique[] {
    return ThematiqueRepository.getAllTuileThematique().filter(
      (t) => t.univers_parent === univers,
    );
  }

  public static getAllTuileUnivers(): TuileUnivers[] {
    return Array.from(ThematiqueRepository.univers.values());
  }
  public static getAllUnivers(): string[] {
    return Array.from(ThematiqueRepository.univers.keys());
  }
  public static getAllThematiquesUnivers(): string[] {
    return Array.from(ThematiqueRepository.thematiquesUnivers.keys());
  }
  public static getAllTuileThematique(): TuileThematique[] {
    return Array.from(ThematiqueRepository.thematiquesUnivers.values());
  }

  public static resetAllRefs() {
    // FOR TEST ONLY
    ThematiqueRepository.titres_thematiques = new Map();
    ThematiqueRepository.univers = new Map();
    ThematiqueRepository.thematiquesUnivers = new Map();
  }

  public async loadThematiques() {
    const new_map = new Map();
    const listeThematiques = await this.prisma.thematique.findMany();
    listeThematiques.forEach((them) => {
      new_map.set(Thematique[them.code], them.titre);
    });
    ThematiqueRepository.titres_thematiques = new_map;
  }

  public async loadUnivers() {
    const listeUnivers = await this.prisma.univers.findMany();

    const new_map = new Map();

    listeUnivers.forEach((u) => {
      new_map.set(
        u.code,
        new TuileUnivers({
          image_url: u.image_url
            ? u.image_url
            : 'https://res.cloudinary.com/dq023imd8/image/upload/v1714635448/univers_climat_a7bedede79.jpg',
          titre: u.label,
          type: u.code,
          etoiles: 0,
          id_cms: u.id_cms,
          is_done: false,
        }),
      );
    });
    ThematiqueRepository.univers = new_map;
  }
  public async loadThematiqueUnivers() {
    const listeThematiqueUnivers =
      await this.prisma.thematiqueUnivers.findMany();

    const new_map = new Map();

    listeThematiqueUnivers.forEach((t) => {
      new_map.set(
        t.code,
        new TuileThematique({
          titre: t.label,
          type: t.code,
          is_locked: false,
          reason_locked: null,
          progression: null,
          cible_progression: null,
          is_new: false,
          niveau: t.niveau,
          image_url: t.image_url
            ? t.image_url
            : 'https://res.cloudinary.com/dq023imd8/image/upload/v1714635448/univers_climat_a7bedede79.jpg',
          univers_parent: t.univers_parent,
          univers_parent_label: ThematiqueRepository.getTitreUnivers(
            t.univers_parent,
          ),
          famille_id_cms: t.famille_id_cms,
          famille_ordre: t.famille_ordre,
        }),
      );
    });

    ThematiqueRepository.thematiquesUnivers = new_map;
  }

  public async upsertThematique(id_cms: number, titre: string, code: string) {
    await this.prisma.thematique.upsert({
      where: {
        id_cms: id_cms,
      },
      create: {
        id: uuidv4(),
        id_cms: id_cms,
        titre: titre,
        code: code,
      },
      update: {
        titre: titre,
        code: code,
      },
    });
  }

  public async upsertUnivers(univers: UniversDefinition) {
    await this.prisma.univers.upsert({
      where: {
        id_cms: univers.id_cms,
      },
      create: {
        id_cms: univers.id_cms,
        code: univers.code,
        label: univers.label,
        image_url: univers.image_url,
      },
      update: {
        code: univers.code,
        label: univers.label,
        image_url: univers.image_url,
      },
    });
  }

  public async deleteThematiqueUnivers(id_cms: number) {
    await this.prisma.thematiqueUnivers.delete({
      where: { id_cms: id_cms },
    });
  }
  public async deleteUnivers(id_cms: number) {
    await this.prisma.univers.delete({
      where: { id_cms: id_cms },
    });
  }
  public async upsertThematiqueUnivers(them: ThematiqueDefinition) {
    await this.prisma.thematiqueUnivers.upsert({
      where: {
        id_cms: them.id_cms,
      },
      create: {
        id_cms: them.id_cms,
        code: them.code,
        label: them.label,
        image_url: them.image_url,
        univers_parent: them.univers_parent,
        niveau: them.niveau,
        famille_id_cms: them.famille_id_cms,
        famille_ordre: them.famille_ordre,
      },
      update: {
        code: them.code,
        label: them.label,
        image_url: them.image_url,
        univers_parent: them.univers_parent,
        niveau: them.niveau,
        famille_id_cms: them.famille_id_cms,
        famille_ordre: them.famille_ordre,
      },
    });
  }

  public static getTuileUniversByCMS_ID(id_cms: number): TuileUnivers {
    const tuile_u = ThematiqueRepository.getAllTuileUnivers().find(
      (t) => t.id_cms === id_cms,
    );
    return tuile_u;
  }
  public static getTitreUnivers(univers: string): string {
    if (!univers) return 'Titre manquant';

    const tuile = ThematiqueRepository.getTuileUnivers(univers);

    if (tuile) {
      return tuile.titre;
    } else {
      return UniversExtraLabels.getLabel(univers);
    }
  }
  public static getTitreThematiqueUnivers(thematiqueUnivers: string): string {
    if (!thematiqueUnivers) return 'Titre manquant';
    const tuile = ThematiqueRepository.getTuileThematique(thematiqueUnivers);
    return tuile ? tuile.titre : 'Titre manquant';
  }
}
