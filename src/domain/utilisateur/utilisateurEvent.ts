export enum EventType {
  quizz_score = 'quizz_score',
  article_lu = 'article_lu',
}

export class UtilisateurEvent {
  type: EventType;
  number_value: number;
  interaction_id: string;
}
