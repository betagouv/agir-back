import { ServiceRechercheID } from './serviceRechercheID';

export enum CategorieRecherche {
  nourriture = 'nourriture',
  marche_local = 'marche_local',
  epicerie_superette = 'epicerie_superette',
  circuit_court = 'circuit_court',
  zero_dechet = 'zero_dechet',
  janvier = 'janvier',
  fevrier = 'fevrier',
  mars = 'mars',
  avril = 'avril',
  mai = 'mai',
  juin = 'juin',
  juillet = 'juillet',
  aout = 'aout',
  septembre = 'septembre',
  octobre = 'octobre',
  novembre = 'novembre',
  decembre = 'decembre',
  vege = 'vege',
  vegan = 'vegan',
  dinde_volaille = 'dinde_volaille',
  saison = 'saison',
}

export class CategorieRechercheLabels {
  private static labels: Record<CategorieRecherche, string> = {
    nourriture: 'Nourriture',
    marche_local: 'Marchés locaux',
    circuit_court: 'Circuits courts',
    epicerie_superette: 'Epiceries et supérettes',
    zero_dechet: 'Zéro déchet',
    janvier: 'janvier',
    fevrier: 'février',
    mars: 'mars',
    avril: 'avril',
    mai: 'mai',
    juin: 'juin',
    juillet: 'juillet',
    aout: 'août',
    septembre: 'septembre',
    octobre: 'octobre',
    novembre: 'novembre',
    decembre: 'décembre',
    dinde_volaille: 'dinde et volaille',
    saison: 'saison',
    vegan: 'vegan',
    vege: 'végé',
  };

  public static getLabel(cat: CategorieRecherche) {
    return CategorieRechercheLabels.labels[cat];
  }
}
