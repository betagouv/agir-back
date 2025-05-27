import { ApiProperty } from '@nestjs/swagger';
import { Recommandation } from '../../../../../src/domain/contenu/recommandation';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { Explication } from '../../../../domain/scoring/system_v2/ExplicationScore';
import { Thematique } from '../../../../domain/thematique/thematique';

export class ExplicationRecoAPI {
  @ApiProperty() inclusion_tag?: string;
  @ApiProperty() exclusion_tag?: string;
  @ApiProperty() valeur?: number;
  @ApiProperty() ponderation?: number;
  @ApiProperty() est_local?: boolean;
  @ApiProperty() est_boost?: boolean;

  static mapToApi(exp: Explication): ExplicationRecoAPI {
    return {
      est_boost: exp.est_boost,
      est_local: exp.est_local,
      exclusion_tag: exp.exclusion_tag,
      inclusion_tag: exp.inclusion_tag,
      ponderation: exp.ponderation,
      valeur: exp.valeur,
    };
  }
}

export class RecommandationAPI {
  @ApiProperty() type: string;
  @ApiProperty() titre: string;
  @ApiProperty() soustitre: string;
  @ApiProperty({ description: 'deprecated' }) thematique_gamification: string; // FIXME : to remove
  @ApiProperty({ enum: Thematique }) thematique_principale: Thematique;
  @ApiProperty() thematique_principale_label: string;
  @ApiProperty() duree: string;
  @ApiProperty() image_url: string;
  @ApiProperty() points: number;
  @ApiProperty() score: number;
  @ApiProperty() content_id: string;
  @ApiProperty() jours_restants: number;
  @ApiProperty({ type: [ExplicationRecoAPI] })
  explications_recommandation: ExplicationRecoAPI[];

  public static mapToAPI(recommandation: Recommandation): RecommandationAPI {
    return {
      content_id: recommandation.content_id,
      type: recommandation.type,
      titre: recommandation.titre,
      soustitre: recommandation.soustitre,
      duree: recommandation.duree,
      thematique_gamification: ThematiqueRepository.getLibelleThematique(
        recommandation.thematique_principale,
      ),
      thematique_principale: recommandation.thematique_principale,
      thematique_principale_label: ThematiqueRepository.getLibelleThematique(
        recommandation.thematique_principale,
      ),
      image_url: recommandation.image_url,
      points: recommandation.points,
      score: recommandation.score,
      jours_restants: recommandation.jours_restants,
      explications_recommandation: recommandation.explicationScore
        ? recommandation.explicationScore.liste_explications.map((e) =>
            ExplicationRecoAPI.mapToApi(e),
          )
        : [],
    };
  }
}
