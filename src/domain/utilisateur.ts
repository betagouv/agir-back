import { Badge } from './badge/badge';
import { UserQuizzProfile } from './quizz/userQuizzProfile';

export class Utilisateur {
  id: string;
  name: string;
  email: string;
  code_postal: string;
  points: number;
  quizzProfile: UserQuizzProfile;
  created_at: Date;
  badges: Badge[];
}
