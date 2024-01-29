import { DifficultyLevel } from '../difficultyLevel';
import { UserQuizzProfile } from '../quizz/userQuizzProfile';
import { Thematique } from '../thematique';
import { ContentType } from './interactionType';

export type SearchFilter = {
  utilisateurId: string;
  type?: ContentType;
  maxNumber?: number;
  pinned?: boolean;
  locked?: boolean;
  quizzProfile?: UserQuizzProfile;
  thematique_gamification?: Thematique[];
  thematiques?: Thematique[];
  code_postal?: string;
  difficulty?: DifficultyLevel;
  done?: boolean;
  quizz_full_success?: boolean;
};
