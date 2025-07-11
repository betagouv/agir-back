import { ApiProperty } from '@nestjs/swagger';
import { EnchainementType } from '../../../../domain/kyc/enchainementDefinition';
import { DetailThematique } from '../../../../domain/thematique/history/detailThematique';
import { Thematique } from '../../../../domain/thematique/thematique';
import { ActionLightAPI } from '../actions/ActionLightAPI';

export class DetailThematiquesAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() est_utilisateur_ngc: boolean;
  @ApiProperty() nom_commune: string;
  @ApiProperty() nombre_recettes: number;
  @ApiProperty() nombre_actions: number;
  @ApiProperty() nombre_aides: number;
  @ApiProperty() nombre_simulateurs: number;
  @ApiProperty({
    enum: EnchainementType,
    description: `L'id d'un enchainement de question pour personnaliser la recommandation d'actions`,
  })
  enchainement_questions_personnalisation: EnchainementType;
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
      est_utilisateur_ngc: detail.est_utilisateur_ngc,
    };
  }
}
