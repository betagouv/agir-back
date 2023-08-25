import { Categorie } from '../categorie';

export type QuizzResultat = {
  score: number;
  difficulty: number;
  categorie: Categorie;
  date: Date;
  quizzId: string;
  utilisateurId: string;
};
