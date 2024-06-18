import { FiltreRecherche } from './filtreRecherche';
import { ResultatRecherche } from './resultatRecherche';

export interface Recherche {
  cherche(filtre: FiltreRecherche): Promise<ResultatRecherche[]>;
}
