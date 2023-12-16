import { ApiProperty } from '@nestjs/swagger';
import { OnboardingResult } from 'src/domain/utilisateur/onboarding/onboardingResult';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';

export class OnboardingResultAPI {
  @ApiProperty({ required: false })
  alimentation: number;
  @ApiProperty({ required: false })
  transports: number;
  @ApiProperty({ required: false })
  logement: number;
  @ApiProperty({ required: false })
  consommation: number;
}
export class UtilisateurProfileAPI {
  @ApiProperty({ required: true })
  nom: string;
  @ApiProperty({ required: true })
  prenom: string;
  @ApiProperty({ required: true })
  email: string;
  @ApiProperty({ required: false })
  code_postal?: string;
  @ApiProperty({ required: false })
  commune?: string;
  @ApiProperty({ required: false })
  revenu_fiscal?: number;
  @ApiProperty({ required: true })
  mot_de_passe?: string;
  @ApiProperty({ required: false })
  nombre_de_parts_fiscales: number;
  @ApiProperty({ required: false })
  abonnement_ter_loire: boolean;

  @ApiProperty({ type: OnboardingResultAPI })
  onboarding_result: OnboardingResultAPI;

  public static mapToAPI(user: Utilisateur): UtilisateurProfileAPI {
    return {
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      code_postal: user.code_postal,
      commune: user.commune,
      revenu_fiscal: user.revenu_fiscal,
      nombre_de_parts_fiscales: user.getNombrePartsFiscalesOuEstimee(),
      abonnement_ter_loire: user.abonnement_ter_loire,
      onboarding_result: user.onboardingResult.ventilation_par_thematiques,
    };
  }
}
