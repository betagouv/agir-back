export enum EventType {
  quizz_score = 'quizz_score',
  article_lu = 'article_lu',
  celebration = 'celebration',
  service_installed = 'service_installed',
}

export class UtilisateurEvent {
  type: EventType;
  number_value?: number;
  interaction_id?: string;
  celebration_id?: string;
  service_id?: string;
}
