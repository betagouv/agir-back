import { DifficultyLevel } from '../difficultyLevel';
import { UserQuizzProfile } from '../quizz/userQuizzProfile';
import { Thematique } from '../thematique';
import { InteractionType } from './interactionType';

export type SearchFilter = {
  utilisateurId: string;
  type?: InteractionType;
  maxNumber?: number;
  pinned?: boolean;
  locked?: boolean;
  quizzProfile?: UserQuizzProfile;
  thematique_gamification?: Thematique[];
  thematiques?: Thematique[];
  code_postal?: string;
  difficulty?: DifficultyLevel;
};
