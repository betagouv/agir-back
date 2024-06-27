import { FiltreRecherche } from './filtreRecherche';
import { ResultatRecherche } from './resultatRecherche';

export interface FinderInterface {
  find(text: string, filtre?: FiltreRecherche): Promise<ResultatRecherche[]>;
}
