import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Partenaire } from '@prisma/client';
import { Echelle } from '../../domain/aides/echelle';
import { PartenaireDefinition } from '../../domain/partenaires/partenaireDefinition';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartenaireRepository implements WithCache {
  private static catalogue_partenaires: Map<string, PartenaireDefinition>;

  constructor(private prisma: PrismaService) {
    PartenaireRepository.catalogue_partenaires = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading partenaires definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  public static getPartenaire(cms_id: string): PartenaireDefinition {
    return PartenaireRepository.catalogue_partenaires.get(cms_id);
  }

  public static getPartenaires(list_cms_id: string[]): PartenaireDefinition[] {
    const result = [];
    for (const cms_id of list_cms_id) {
      const part = this.getPartenaire(cms_id);
      if (part) {
        result.push(part);
      }
    }
    return result;
  }

  public static getAllPartenaires(): PartenaireDefinition[] {
    return Array.from(PartenaireRepository.catalogue_partenaires.values());
  }

  public static resetCache() {
    // FOR TEST ONLY
    PartenaireRepository.catalogue_partenaires = new Map();
  }

  @Cron('* * * * *')
  public async loadCache() {
    const new_map: Map<string, PartenaireDefinition> = new Map();
    const listePartenaires = await this.prisma.partenaire.findMany();
    for (const partenaire of listePartenaires) {
      new_map.set(partenaire.content_id, {
        id_cms: partenaire.content_id,
        nom: partenaire.nom,
        url: partenaire.url,
        image_url: partenaire.image_url,
        echelle: Echelle[partenaire.echelle],
        code_commune: partenaire.code_commune,
        code_epci: partenaire.code_epci,
        liste_codes_commune_from_EPCI: partenaire.liste_communes_calculees,
        code_departement: partenaire.code_departement,
        code_region: partenaire.code_region,
      });
    }
    PartenaireRepository.catalogue_partenaires = new_map;
  }

  public async delete(cms_id: string) {
    await this.prisma.partenaire.delete({ where: { content_id: cms_id } });
  }

  public async upsert(partenaire: PartenaireDefinition) {
    const data: Partenaire = {
      content_id: partenaire.id_cms,
      image_url: partenaire.image_url,
      nom: partenaire.nom,
      url: partenaire.url,
      echelle: partenaire.echelle,
      code_commune: partenaire.code_commune,
      code_epci: partenaire.code_epci,
      liste_communes_calculees: partenaire.liste_codes_commune_from_EPCI,
      code_departement: partenaire.code_departement,
      code_region: partenaire.code_region,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.partenaire.upsert({
      where: {
        content_id: data.content_id,
      },
      create: data,
      update: data,
    });
  }
}
