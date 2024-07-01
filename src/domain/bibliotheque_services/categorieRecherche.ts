import { ServiceRechercheID } from './serviceRechercheID';

export enum CategorieRecherche {
  nourriture = 'nourriture',
  marche_local = 'marche_local',
  epicerie_superette = 'epicerie_superette',
  circuit_court = 'circuit_court',
  zero_dechet = 'zero_dechet',
}

export class CategorieRechercheLabels {
  private static labels: Record<CategorieRecherche, string> = {
    nourriture: 'Nourriture',
    marche_local: 'Marchés locaux',
    circuit_court: 'Circuits courts',
    epicerie_superette: 'Epiceries et supérettes',
    zero_dechet: 'Zéro déchet',
  };

  public static getLabel(cat: CategorieRecherche) {
    return CategorieRechercheLabels.labels[cat];
  }
}
