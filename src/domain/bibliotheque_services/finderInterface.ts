import { FiltreRecherche } from './filtreRecherche';
import { ResultatRecherche } from './resultatRecherche';

export interface FinderInterface {
  find(filtre: FiltreRecherche): Promise<ResultatRecherche[]>;
}
