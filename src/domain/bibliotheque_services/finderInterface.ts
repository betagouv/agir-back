import { ResultatRecherche } from './resultatRecherche';

export interface FinderInterface {
  find(text: string): Promise<ResultatRecherche[]>;
}
