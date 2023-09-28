import { Badge } from '../badge/badge';
import { UserQuizzProfile } from '../quizz/userQuizzProfile';

export class Utilisateur {
  id: string;
  name: string; // FIXME remove
  email: string;
  nom: string;
  prenom: string;
  passwordHash: string;
  passwordSalt: string;
  onboardingData: {};
  code_postal: string;
  points: number;
  quizzProfile: UserQuizzProfile;
  created_at: Date;
  badges: Badge[];
}
