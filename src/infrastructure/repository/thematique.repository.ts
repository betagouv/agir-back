import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Thematique } from '../../domain/contenu/thematique';
import { App } from '../../../src/domain/app';
import { Univers } from '../../domain/univers/univers';
import { TuileUnivers } from '../../domain/univers/tuileUnivers';

@Injectable()
export class ThematiqueRepository {
  static titres_thematiques: Map<Thematique, string>;
  static univers: Map<Univers, TuileUnivers>;

  constructor(private prisma: PrismaService) {
    ThematiqueRepository.titres_thematiques = new Map();
    ThematiqueRepository.univers = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!App.isFirstStart()) {
      await this.loadThematiques();
      await this.loadUnivers();
    }
  }

  public static getLibelleThematique(thematique: Thematique): string {
    const libelle = ThematiqueRepository.titres_thematiques.get(thematique);
    return libelle || thematique.toString();
  }

  public static getUnivers(type: Univers): TuileUnivers {
    return ThematiqueRepository.univers.get(type);
  }

  public static getAllUnivers(): TuileUnivers[] {
    return Array.from(ThematiqueRepository.univers.values());
  }
  public static resetThematiquesUnivers() {
    // FOR TEST ONLY
    ThematiqueRepository.titres_thematiques = new Map();
    ThematiqueRepository.univers = new Map();
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
          image_url: u.image_url,
          titre: u.label,
          type: Univers[u.code],
          etoiles: 0,
          is_locked: false,
          reason_locked: null,
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

  private setTitreOfThematiqueByCmsId(cms_id: number, titre: string) {
    ThematiqueRepository.titres_thematiques.set(
      ThematiqueRepository.getThematiqueByCmsId(cms_id),
      titre,
    );
  }

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
}
