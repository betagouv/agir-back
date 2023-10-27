import { ApiProperty } from '@nestjs/swagger';
import { BadgeAPI } from '../badgeAPI';
import { QuizzProfileAPI } from '../quizzProfileAPI';
import { ServiceAPI } from '../serviceAPI';

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
  @ApiProperty({ type: [ServiceAPI] })
  services: ServiceAPI[];
}
