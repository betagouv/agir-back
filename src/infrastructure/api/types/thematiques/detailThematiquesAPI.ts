import { ApiProperty } from '@nestjs/swagger';
import { DetailThematique } from '../../../../domain/thematique/history/detailThematique';
import { Thematique } from '../../../../domain/thematique/thematique';
import { Enchainement } from '../../../../usecase/questionKYCEnchainement.usecase';
import { ActionLightAPI } from '../actions/ActionLightAPI';

export class DetailThematiquesAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() nom_commune: string;
  @ApiProperty() nombre_recettes: number;
  @ApiProperty() nombre_actions: number;
  @ApiProperty() nombre_aides: number;
  @ApiProperty() nombre_simulateurs: number;
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
      nombre_actions: detail.nombre_actions,
      nombre_aides: detail.nombre_aides,
      nombre_recettes: detail.nombre_recettes,
      nombre_simulateurs: detail.nombre_simulateurs,
      nom_commune: detail.nom_commune,
    };
  }
}
