import { InteractionType } from './interactionType';

export type InteractionDefinition = {
  id: string;
  content_id?: string;
  type: InteractionType;
  titre: string;
  soustitre?: string;
  categorie: string;
  tags: [];
  duree?: string;
  frequence?: string;
  image_url: string;
  url?: string;
  difficulty: number;
  points: number;
  score: number;
  locked: boolean;
  pinned_at_position: number;
  raison_lock: string;
  day_period: number;
  created_at?: Date;
  updated_at?: Date;
};
