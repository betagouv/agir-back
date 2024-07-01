import { Injectable } from '@nestjs/common';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/resultatRecherche';

const API_URL = 'https://';

export type RecettesResponse = {
  id: string;
  titre: string;
  type: string;
  difficulty: string;
  temps_prepa_min: number;
  vege: boolean;
  vegan: boolean;
  volaille: boolean;
  saison: boolean;
}[];

@Injectable()
export class RecettesRepository implements FinderInterface {
  constructor() {}

  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.vegan,
      CategorieRecherche.vege,
      CategorieRecherche.dinde_volaille,
      CategorieRecherche.saison,
    ];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const result = await this.callServiceAPI(filtre);

    const mapped_result = result.map(
      (r) =>
        new ResultatRecherche({
          id: r.id,
          titre: r.titre,
          difficulty_plat: r.difficulty,
          type_plat: r.type,
          temps_prepa_min: r.temps_prepa_min,
        }),
    );

    mapped_result.sort((a, b) => a.impact_carbone_kg - b.impact_carbone_kg);

    return mapped_result;
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
  ): Promise<RecettesResponse> {
    const result = [
      {
        id: '1',
        titre: 'Tian de sardines',
        difficulty: 'Intérmédiaire',
        saison: true,
        temps_prepa_min: 30,
        type: 'Plat principal',
        vegan: false,
        vege: false,
        volaille: false,
      },
      {
        id: '2',
        titre: 'Dinde à la provençale',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 40,
        type: 'Plat principal',
        vegan: false,
        vege: false,
        volaille: true,
      },
      {
        id: '3',
        titre: 'Salade crevettes au curry',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 20,
        type: 'Entrée',
        vegan: false,
        vege: false,
        volaille: false,
      },
      {
        id: '4',
        titre: 'Quiche saumon',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 25,
        type: 'Entrée',
        vegan: false,
        vege: false,
        volaille: false,
      },
      {
        id: '5',
        titre: 'Tiramissu',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 20,
        type: 'Déssert',
        vegan: false,
        vege: true,
        volaille: false,
      },
    ];
    switch (filtre.categorie) {
      case CategorieRecherche.vegan:
        return [];
      case CategorieRecherche.vege:
        return result.filter((a) => a.vege);
      case CategorieRecherche.dinde_volaille:
        return result.filter((a) => a.volaille);
      case CategorieRecherche.saison:
        return result;
      default:
        return result;
    }
  }
}
