import { ApiProperty } from '@nestjs/swagger';
import { Recommandation } from 'src/domain/recommandation';

export class RecommandationAPI {
  @ApiProperty() type: string;
  @ApiProperty() titre: string;
  @ApiProperty() soustitre: string;
  @ApiProperty() thematique_gamification: string;
  @ApiProperty() duree: string;
  @ApiProperty() image_url: string;
  @ApiProperty() points: number;
  @ApiProperty() content_id: string;

  public static mapToAPI(recommandation: Recommandation): RecommandationAPI {
    return {
      content_id: recommandation.content_id,
      type: recommandation.type,
      titre: recommandation.titre,
      soustitre: recommandation.soustitre,
      duree: recommandation.duree,
      thematique_gamification: recommandation.thematique_gamification_titre,
      image_url: recommandation.image_url,
      points: recommandation.points,
    };
  }
}
