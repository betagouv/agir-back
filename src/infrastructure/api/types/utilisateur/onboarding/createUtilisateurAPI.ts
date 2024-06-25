import { ApiProperty } from '@nestjs/swagger';

export class CreateUtilisateurAPI {
  @ApiProperty()
  nom?: string;
  @ApiProperty()
  prenom?: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  code_postal: string;
  @ApiProperty()
  commune: string;
  @ApiProperty()
  annee_naissance: number;
  @ApiProperty({ required: false })
  mot_de_passe?: string;
  /*
  @ApiProperty({ type: OnboardingDataAPI })
  onboardingData: OnboardingDataAPI;
  */
}
