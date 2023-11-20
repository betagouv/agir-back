export enum EventType {
  quizz_score = 'quizz_score',
}

export class UtilisateurEvent {
  type: EventType;
  number_value: number;
  interaction_id: string;
}
