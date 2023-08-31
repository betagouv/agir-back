import { Badge } from 'src/domain/badge';

export type UtilisateurAPI = {
  id: string;
  name: string;
  email?: string;
  points: number;
  quizzProfile: object;
  created_at: Date;
  badges: Badge[];
};
