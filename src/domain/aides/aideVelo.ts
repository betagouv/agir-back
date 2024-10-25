import { Aide, Questions } from '@betagouv/aides-velo';

export type Collectivite = Aide['collectivity'];

export type AideVelo = {
  libelle: string;
  montant: number;
  plafond: number;
  lien: string;
  collectivite: Collectivite;
  description: string;
  logo?: string;
};

export type AidesVeloParType = {
  [category in Questions['vélo . type']]: AideVelo[];
};
