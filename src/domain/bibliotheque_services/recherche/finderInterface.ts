import { CategorieRecherche } from './categorieRecherche';
import { FiltreRecherche } from './filtreRecherche';
import { ResultatRecherche } from './resultatRecherche';

export interface FinderInterface {
  find(filtre: FiltreRecherche): Promise<ResultatRecherche[]>;

  getManagedCategories(): CategorieRecherche[];

  getMaxResultOfCategorie(cat: CategorieRecherche): number;
}
