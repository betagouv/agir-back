import { ApiProperty } from '@nestjs/swagger';
import { DetailThematique } from '../../../../domain/thematique/history/detailThematique';
import { Thematique } from '../../../../domain/thematique/thematique';
import { Enchainement } from '../../../../usecase/questionKYC.usecase';
import { ActionLightAPI } from '../actions/ActionLightAPI';

export class DetailThematiquesAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty({
    enum: Enchainement,
    description: `L'id d'un enchainement de question pour personnaliser la recommandation d'actions`,
  })
  enchainement_questions_personnalisation: Enchainement;
  @ApiProperty({
    description: `boolean indiquant s'il est nécessaire de poser les questions de personnalisation pour l'utilisateur courant`,
  })
  est_personnalisation_necessaire: boolean;

  @ApiProperty({ type: [ActionLightAPI] })
  liste_actions_recommandees: ActionLightAPI[];

  public static mapToAPI(detail: DetailThematique): DetailThematiquesAPI {
    return {
      thematique: detail.thematique,
      est_personnalisation_necessaire: detail.personnalisation_necessaire,
      enchainement_questions_personnalisation:
        detail.enchainement_questions_personnalisation,
      liste_actions_recommandees: detail.liste_actions.map((a) =>
        ActionLightAPI.mapToAPI(a),
      ),
    };
  }
}
