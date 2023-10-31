import { ApiProperty } from '@nestjs/swagger';
import { BadgeAPI } from '../badgeAPI';
import { QuizzProfileAPI } from '../quizz/quizzProfileAPI';
import { TodoAPI } from '../todo/todoAPI';

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
  revenu_fiscal: number;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  points: number;

  @ApiProperty()
  quizzProfile: QuizzProfileAPI;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ type: [BadgeAPI] })
  badges: BadgeAPI[];

  @ApiProperty({ type: TodoAPI })
  todo: TodoAPI;
}
