import { InteractionType } from './interactionType';

export type SearchFilter = {
  utilisateurId: string;
  type?: InteractionType;
  maxNumber?: number;
  pinned?: boolean;
  locked?: boolean;
};
