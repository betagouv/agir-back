export enum CategorieRecherche {
  score_risque = 'score_risque',
  vos_objets = 'vos_objets',
  donner = 'donner',
  jeter = 'jeter',
  reparer = 'reparer',
  vendre = 'vendre',
  louer = 'louer',
  acheter = 'acheter',
  emprunter = 'emprunter',
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
  poisson = 'poisson',
  any_transport = 'any_transport',
}

export enum SousCategorieRecherche {
  sans_saumon_crevette_cabillaud = 'sans_saumon_crevette_cabillaud',
  sans_saumon = 'sans_saumon',
  sans_cuisson = 'sans_cuisson',
  chaussures = 'chaussures',
}

export class CategorieRechercheManager {
  private static MOIS_ANNEE = [
    CategorieRecherche.janvier,
    CategorieRecherche.fevrier,
    CategorieRecherche.mars,
    CategorieRecherche.avril,
    CategorieRecherche.mai,
    CategorieRecherche.juin,
    CategorieRecherche.juillet,
    CategorieRecherche.aout,
    CategorieRecherche.septembre,
    CategorieRecherche.octobre,
    CategorieRecherche.novembre,
    CategorieRecherche.decembre,
  ];
  private static DEFAULT_CATEGORIES = [
    CategorieRecherche.nourriture,
    CategorieRecherche.saison,
    CategorieRecherche.any_transport,
    CategorieRecherche.vos_objets,
  ];
  private static labels: Record<CategorieRecherche, string> = {
    score_risque: 'Score des risques naturelles',
    vos_objets: 'Mes objets',
    donner: 'Donner',
    jeter: 'Jeter',
    reparer: 'Réparer',
    vendre: 'Vendre',
    louer: 'Louer',
    acheter: `Acheter d'occasion`,
    emprunter: 'Emprunter',
    nourriture: 'Tous les commerces',
    marche_local: 'Les marchés locaux',
    circuit_court: 'Les producteurs locaux',
    epicerie_superette: 'Les épiceries et supérettes',
    zero_dechet: 'Les boutiques zéro déchet',
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
    dinde_volaille: 'avec volaille',
    saison: 'de saison',
    poisson: 'avec poisson',
    vegan: '100% végétales',
    vege: 'végétariennes',
    any_transport: 'Tout mode de déplacement',
  };

  public static getLabel(cat: string): string {
    return CategorieRechercheManager.labels[cat] || cat;
  }

  public static isDefault(cat: CategorieRecherche): boolean {
    if (CategorieRechercheManager.MOIS_ANNEE.includes(cat)) {
      const mois_courant = this.getMoisCourant();
      return mois_courant === cat;
    }
    return CategorieRechercheManager.DEFAULT_CATEGORIES.includes(cat);
  }

  public static getMoisCourant(): CategorieRecherche {
    return CategorieRechercheManager.MOIS_ANNEE[new Date().getMonth()];
  }
}
