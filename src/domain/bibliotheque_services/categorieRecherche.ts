import { ServiceRechercheID } from './serviceRechercheID';

export enum CategorieRecherche {
  lieux_collaboratifs = 'lieux_collaboratifs',
  nourriture = 'nourriture',
  default = 'default',
}

export class CategorieRechercheLabels {
  private static labels: Record<CategorieRecherche, string> = {
    default: 'tout',
    lieux_collaboratifs: 'Lieux collaboratifs',
    nourriture: 'Nourriture',
  };

  public static getLabel(cat: CategorieRecherche) {
    return CategorieRechercheLabels.labels[cat];
  }
}
