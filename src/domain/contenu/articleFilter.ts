import { Echelle } from '../aides/echelle';
import { Thematique } from '../thematique/thematique';
import { Categorie } from './categorie';
import { DifficultyLevel } from './difficultyLevel';

export type ArticleFilter = {
  code_postal?: string;
  code_commune?: string;
  echelle?: Echelle;
  thematiques?: Thematique[];
  difficulty?: DifficultyLevel;
  exclude_ids?: string[];
  include_ids?: string[];
  asc_difficulty?: boolean;
  titre_fragment?: string;
  categorie?: Categorie;
  date?: Date;
  skip?: number;
  take?: number;
};
