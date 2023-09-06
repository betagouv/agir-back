import { Badge } from './badge/badge';
import { UserQuizzProfile } from './quizz/userQuizzProfile';

export class Utilisateur {
  constructor(
    public id?: string,
    public name?: string,
    public email?: string,
    public code_postal?: string,
    public points?: number,
    public quizzProfile?: UserQuizzProfile,
    public created_at?: Date,
    public badges?: Badge[],
  ) {}
}
