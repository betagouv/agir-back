export enum RecommandationType {
  article = 'article',
  quizz = 'quizz',
}

export class Recommandation {
  content_id: string;
  type: RecommandationType;
  titre: string;
  soustitre?: string;
  thematique_gamification_titre: string;
  duree?: string;
  image_url: string;
  points: number;
}
