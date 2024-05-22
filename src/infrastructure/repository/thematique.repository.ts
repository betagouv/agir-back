import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Thematique } from '../../domain/contenu/thematique';
import { App } from '../../../src/domain/app';
import { Univers } from '../../domain/univers/univers';
import { TuileUnivers } from '../../domain/univers/tuileUnivers';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { TuileThematique } from '../../../src/domain/univers/tuileThematique';

@Injectable()
export class ThematiqueRepository {
  static titres_thematiques: Map<Thematique, string>;
  static univers: Map<Univers, TuileUnivers>;
  static thematiquesUnivers: Map<ThematiqueUnivers, TuileThematique>;

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

  public static getLibelleThematique(thematique: Thematique): string {
    const libelle = ThematiqueRepository.titres_thematiques.get(thematique);
    return libelle || thematique.toString();
  }

  public static getTuileUnivers(type: Univers): TuileUnivers {
    return ThematiqueRepository.univers.get(type);
  }
  public static getTuileThematique(type: ThematiqueUnivers): TuileThematique {
    return ThematiqueRepository.thematiquesUnivers.get(type);
  }
  public static getUniversParent(thematiqueUnivers: ThematiqueUnivers) {
    return ThematiqueRepository.getTuileThematique(thematiqueUnivers)
      .univers_parent;
  }

  public static getTuileThematiques(univers: Univers): TuileThematique[] {
    return ThematiqueRepository.getAllTuileThematique().filter(
      (t) => t.univers_parent === univers,
    );
  }

  public static getAllTuileUnivers(): TuileUnivers[] {
    return Array.from(ThematiqueRepository.univers.values());
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
    const listeThematiques = await this.prisma.thematique.findMany();
    listeThematiques.forEach((them) => {
      this.setTitreOfThematiqueByCmsId(them.id_cms, them.titre);
    });
  }

  public async loadUnivers() {
    const listeUnivers = await this.prisma.univers.findMany();
    listeUnivers.forEach((u) => {
      ThematiqueRepository.univers.set(
        Univers[u.code],
        new TuileUnivers({
          image_url: u.image_url
            ? u.image_url
            : 'https://res.cloudinary.com/dq023imd8/image/upload/v1714635448/univers_climat_a7bedede79.jpg',
          titre: u.label,
          type: Univers[u.code],
          etoiles: 0,
          is_locked: false,
          reason_locked: null,
        }),
      );
    });
  }
  public async loadThematiqueUnivers() {
    const listeThematiqueUnivers =
      await this.prisma.thematiqueUnivers.findMany();
    listeThematiqueUnivers.forEach((t) => {
      ThematiqueRepository.thematiquesUnivers.set(
        ThematiqueUnivers[t.code],
        new TuileThematique({
          titre: t.label,
          type: ThematiqueUnivers[t.code],
          is_locked: false,
          reason_locked: null,
          progression: null,
          cible_progression: null,
          is_new: false,
          niveau: 0,
          image_url: t.image_url
            ? t.image_url
            : 'https://res.cloudinary.com/dq023imd8/image/upload/v1714635448/univers_climat_a7bedede79.jpg',
          univers_parent: Univers[t.univers_parent],
          univers_parent_label: ThematiqueRepository.getTitreUnivers(
            Univers[t.univers_parent],
          ),
        }),
      );
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

  public async upsertUnivers(
    id_cms: number,
    code: string,
    label: string,
    image_url: string,
  ) {
    await this.prisma.univers.upsert({
      where: {
        id_cms: id_cms,
      },
      create: {
        id_cms: id_cms,
        code: code,
        label: label,
        image_url: image_url,
      },
      update: {
        code: code,
        label: label,
        image_url: image_url,
      },
    });
  }
  public async upsertThematiqueUnivers(
    id_cms: number,
    code: string,
    label: string,
    image_url: string,
    univers_parent: Univers,
  ) {
    await this.prisma.thematiqueUnivers.upsert({
      where: {
        id_cms: id_cms,
      },
      create: {
        id_cms: id_cms,
        code: code,
        label: label,
        image_url: image_url,
        univers_parent: univers_parent,
      },
      update: {
        code: code,
        label: label,
        image_url: image_url,
        univers_parent: univers_parent,
      },
    });
  }

  private setTitreOfThematiqueByCmsId(cms_id: number, titre: string) {
    ThematiqueRepository.titres_thematiques.set(
      ThematiqueRepository.getThematiqueByCmsId(cms_id),
      titre,
    );
  }

  // FIXME : basculer sur une gestion de code et pas d'id tech CMS
  public static getThematiqueByCmsId(cms_id: number): Thematique {
    if (cms_id > Object.values(Thematique).length) {
      return undefined;
    } else {
      return [
        Thematique.alimentation,
        Thematique.climat,
        Thematique.consommation,
        Thematique.dechet,
        Thematique.logement,
        Thematique.transport,
        Thematique.loisir,
      ][cms_id - 1];
    }
  }

  public static getTitreUnivers(univers: Univers): string {
    if (!univers) return 'Titre manquant';
    const tuile = ThematiqueRepository.getTuileUnivers(univers);
    return tuile ? tuile.titre : 'Titre manquant';
  }
  public static getTitreThematiqueUnivers(
    thematiqueUnivers: ThematiqueUnivers,
  ): string {
    if (!thematiqueUnivers) return 'Titre manquant';
    const tuile = ThematiqueRepository.getTuileThematique(thematiqueUnivers);
    return tuile ? tuile.titre : 'Titre manquant';
  }
}
