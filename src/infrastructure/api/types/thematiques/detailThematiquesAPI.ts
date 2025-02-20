import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/thematique/thematique';
import { DetailThematique } from '../../../../domain/thematique/detailThematique';
import { Enchainement } from '../../../../domain/kyc/questionKYC';
import { ActionLightAPI } from '../actions/ActionLightAPI';

export class DetailThematiquesAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty({
    enum: Enchainement,
    description: `L'id d'un enchainement de question pour personnaliser la recommandation d'actions`,
  })
  enchainement_questions_personalisation: Enchainement;
  @ApiProperty({
    description: `boolean indiquant s'il est nécessaire de poser les questions de personnalisation pour l'utilisateur courant`,
  })
  est_personalisation_necessaire: boolean;

  @ApiProperty({ type: [ActionLightAPI] })
  liste_actions_recommandees: ActionLightAPI[];

  public static mapToAPI(detail: DetailThematique): DetailThematiquesAPI {
    return {
      thematique: detail.thematique,
      est_personalisation_necessaire: detail.personalisation_necessaire,
      enchainement_questions_personalisation:
        detail.enchainement_questions_personalisation,
      liste_actions_recommandees: [],
    };
  }
}
