import { ContentType } from './contenu/contentType';

export enum EventType {
  quizz_score = 'quizz_score',
  article_lu = 'article_lu',
  reveal = 'reveal',
  service_installed = 'service_installed',
  access_catalogue_aides = 'access_catalogue_aides',
  access_profile = 'access_profile',
  access_recommandations = 'access_recommandations',
  like = 'like',
  article_favoris = 'article_favoris',
  article_non_favoris = 'article_non_favoris',
  access_conf_linky = 'access_conf_linky',
}

export class AppEvent {
  type: EventType;
  number_value?: number;
  interaction_id?: string;
  reveal_id?: string;
  service_id?: string;
  content_id?: string;
  content_type?: ContentType.article | ContentType.quizz;
}
