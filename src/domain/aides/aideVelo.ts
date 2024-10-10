export type AideVelo = {
  libelle: string;
  montant: string | null;
  plafond: string | null;
  lien: string;
  collectivite?: Collectivite;
  description?: string;
  logo?: string;
};
export type Collectivite = {
  kind: string;
  value: string;
  code?: string;
};
export type AidesVelo = AideVelo[];

export type AidesVeloParType = {
  [category in TypeVelos]: AideVelo[];
};

export type Localisation = {
  nom: string;
  slug: string;
  epci: string;
  zfe: string;
  code: string;
  codesPostaux: string[];
  departement: string;
  region: string;
  pays: string;
};

// TODO: Should be auto-generated from the publicodes rules
export type InputParameters = Partial<{
  'localisation . pays': string;
  'localisation . code insee': string;
  'localisation . epci': string;
  'localisation . département': string;
  'localisation . région': string;
  'localisation . ZFE': boolean;
  'vélo . type': TypeVelos;
  'vélo . prix': number;
  'revenu fiscal de référence': number;
  'maximiser les aides'?: 'oui' | 'non';
  'aides . pays de la loire . abonné TER'?: boolean;
}>;

export type TypeVelos =
  | 'mécanique simple'
  | 'électrique'
  | 'cargo'
  | 'cargo électrique'
  | 'pliant'
  | 'motorisation'
  | 'adapté';
