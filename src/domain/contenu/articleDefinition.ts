import { Echelle } from '../aides/echelle';
import { TagUtilisateur } from '../scoring/tagUtilisateur';
import { Thematique } from '../thematique/thematique';
import { Categorie } from './categorie';
import { ContenuLocal } from './contenuLocal';
import { DifficultyLevel } from './difficultyLevel';

export class SourceArticle {
  label: string;
  url: string;
}

export class ArticleDefinition implements ContenuLocal {
  content_id: string;
  titre: string;
  soustitre: string;
  source: string;
  sources: SourceArticle[];
  contenu: string;
  image_url: string;
  partenaire_id: string;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  echelle: Echelle;
  duree: string;
  frequence: string;
  difficulty: DifficultyLevel;
  points: number;
  thematique_principale: Thematique;
  thematiques: Thematique[];
  tags_utilisateur: TagUtilisateur[];
  categorie: Categorie;
  mois: number[];
  include_codes_commune: string[];
  exclude_codes_commune: string[];
  codes_departement: string[];
  codes_region: string[];
  tag_article: string;
  derniere_maj: Date;
}
