import { TagUtilisateur } from '../scoring/tagUtilisateur';
import { Categorie } from './categorie';
import { Thematique } from '../thematique/thematique';

export type QuizzReponse = {
  reponse: string;
  est_bonne_reponse: boolean;
};

export type QuizzQuestion = {
  libelle: string;
  explication_ok: string;
  explication_ko: string;
  reponses: QuizzReponse[];
};

export type QuizzQuestionSet = {
  liste_questions: QuizzQuestion[];
};

export class QuizzDefinition {
  content_id: string;
  article_id: string;
  titre: string;
  soustitre: string;
  source: string;
  image_url: string;
  partenaire_id: string;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  duree: string;
  frequence: string;
  difficulty: number;
  points: number;
  thematique_principale: Thematique;
  thematiques: Thematique[];
  tags_utilisateur: TagUtilisateur[];
  categorie: Categorie;
  mois: number[];
  questions: QuizzQuestionSet;
}
