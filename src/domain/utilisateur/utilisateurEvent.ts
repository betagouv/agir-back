import { ContentType } from '../interaction/interactionType';

export enum EventType {
  quizz_score = 'quizz_score',
  article_lu = 'article_lu',
  celebration = 'celebration',
  reveal = 'reveal',
  service_installed = 'service_installed',
  access_catalogue_aides = 'access_catalogue_aides',
  access_profile = 'access_profile',
  access_recommandations = 'access_recommandations',
  like = 'like',
}

export class UtilisateurEvent {
  type: EventType;
  number_value?: number;
  interaction_id?: string;
  celebration_id?: string;
  reveal_id?: string;
  service_id?: string;
  content_id?: string;
  content_type?: ContentType.article | ContentType.quizz;
}
