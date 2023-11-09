import { ApiProperty } from '@nestjs/swagger';
import { OnboardingDataAPI } from './onboardingDataAPI';

export class CreateUtilisateurAPI {
  @ApiProperty()
  nom?: string;
  @ApiProperty()
  prenom?: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ required: false })
  mot_de_passe?: string;
  @ApiProperty({ type: OnboardingDataAPI })
  onboardingData: OnboardingDataAPI;
}