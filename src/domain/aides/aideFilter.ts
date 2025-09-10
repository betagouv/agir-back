import { Thematique } from '../thematique/thematique';
import { Echelle } from './echelle';

export type AideFilter = {
  code_postal?: string;
  code_commune?: string;
  echelle?: Echelle;
  maxNumber?: number;
  thematiques?: Thematique[];
  besoins?: string[];
  date_expiration?: Date;
};
