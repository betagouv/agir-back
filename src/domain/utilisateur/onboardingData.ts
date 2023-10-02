export enum Transport {
  voiture = 'voiture',
  moto = 'moto',
  pied = 'pied',
  velo = 'velo',
  commun = 'commun',
}

export class OnboardingData {
  transports?: Transport[];
  avion?: number;
  code_postal?: string;
  adultes?: number;
  enfants?: number;
  residence?: 'maison' | 'appartement';
  proprietaire?: boolean;
  superficie?: 'petit' | 'moyen' | 'grand';
  chauffage?: 'electricite' | 'bois' | 'fioul' | 'gaz' | 'autre' | '?';
  repas?: 'tout' | 'vege' | 'vegan' | 'viande';
  consommation?: 'raisonnable' | 'secondemain' | 'shopping' | 'jamais';
}
