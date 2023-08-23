import { QuizzProfile } from './quizz/quizzProfile';

export type Utilisateur = {
  name?: string;
  email?: string;
  quizzLevels?: QuizzProfile;
};
