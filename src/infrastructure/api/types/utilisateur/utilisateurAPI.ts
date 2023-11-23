import { ApiProperty } from '@nestjs/swagger';
import { BadgeAPI } from '../gamification/badgeAPI';
import { QuizzProfileAPI } from '../quizz/quizzProfileAPI';

export class UtilisateurAPI {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  prenom: string;

  @ApiProperty()
  code_postal: string;

  @ApiProperty()
  commune: string;

  @ApiProperty()
  revenu_fiscal: number;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  points: number;

  @ApiProperty()
  quizzProfile: QuizzProfileAPI;

  @ApiProperty()
  created_at: Date;
  /*
  @ApiProperty({ type: [BadgeAPI] })
  badges: BadgeAPI[];
  */
}
