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

export type AideVeloNonCalculee = Omit<AideVelo, 'plafond' | 'montant'>;

export type AidesVeloParType<A = AideVelo> = {
  [category in Questions['vélo . type']]: A[];
};

export const NB_VELO_TYPES = 8;
