import { DifficultyLevel } from './difficultyLevel';
import { Thematique } from './thematique';
import { TagUtilisateur } from '../scoring/tagUtilisateur';
import { Categorie } from './categorie';
import { ContenuLocal } from './contenuLocal';

export class SourceArticle {
  label: string;
  url: string;
}

export class ArticleDefinition implements ContenuLocal {
  content_id: string;
  titre: string;
  soustitre: string | null;
  source: string;
  sources: SourceArticle[];
  contenu: string | null;
  image_url: string | null;
  partenaire_id: string | null;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  duree: string | null;
  frequence: string | null;
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
  tag_article: string | null;
  derniere_maj: Date | null;
}
