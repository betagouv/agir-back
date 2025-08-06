import { Echelle } from '../aides/echelle';
import { TagUtilisateur } from '../scoring/tagUtilisateur';
import { Thematique } from '../thematique/thematique';
import { Categorie } from './categorie';
import { ContenuLocal } from './contenuLocal';
import { DifficultyLevel } from './difficultyLevel';
import { Source } from './source';

export class ArticleDefinition
  implements ContenuLocal, AssociatedWithPartenaires
{
  categorie: Categorie;
  codes_commune_from_partenaire: string[];
  codes_departement_from_partenaire: string[];
  codes_departement: string[];
  codes_postaux: string[];
  codes_region_from_partenaire: string[];
  codes_region: string[];
  content_id: string;
  contenu: string;
  derniere_maj: Date;
  difficulty: DifficultyLevel;
  duree: string;
  echelle: Echelle;
  exclude_codes_commune: string[];
  frequence: string;
  image_url: string;
  include_codes_commune: string[];
  mois: number[];
  partenaire_id: string;
  points: number;
  rubrique_ids: string[];
  rubrique_labels: string[];
  sources: Source[];
  source: string;
  soustitre: string;
  tags_a_exclure: string[];
  tags_a_inclure: string[];
  tags_utilisateur: TagUtilisateur[];
  thematique_principale: Thematique;
  thematiques: Thematique[];
  titre: string;
  VISIBLE_PROD: boolean;

  constructor(def: {
    categorie: Categorie;
    codes_commune_from_partenaire: string[];
    codes_departement_from_partenaire: string[];
    codes_departement: string[];
    codes_postaux: string[];
    codes_region_from_partenaire: string[];
    codes_region: string[];
    content_id: string;
    contenu: string;
    derniere_maj: Date;
    difficulty: DifficultyLevel;
    duree: string;
    echelle: Echelle;
    exclude_codes_commune: string[];
    frequence: string;
    image_url: string;
    include_codes_commune: string[];
    mois: number[];
    partenaire_id: string;
    points: number;
    rubrique_ids: string[];
    rubrique_labels: string[];
    sources: Source[];
    source: string;
    soustitre: string;
    tags_a_exclure: string[];
    tags_a_inclure: string[];
    tags_utilisateur: TagUtilisateur[];
    thematique_principale: Thematique;
    thematiques: Thematique[];
    titre: string;
    VISIBLE_PROD: boolean;
  }) {
    Object.assign(this, def);
  }

  getPartenaireIds(): string[] {
    return [this.partenaire_id];
  }
}
