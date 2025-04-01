import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../../../../domain/contenu/article';
import { Thematique } from '../../../../domain/thematique/thematique';

export class ArticleLightAPI {
  @ApiProperty() titre: string;
  @ApiProperty() soustitre: string;
  @ApiProperty() content_id: string;
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques?: Thematique[];
  @ApiProperty() image_url: string;
  @ApiProperty({ enum: Thematique }) thematique_principale: Thematique;

  public static mapToAPI(article: Article): ArticleLightAPI {
    return {
      content_id: article.content_id,
      titre: article.titre,
      soustitre: article.soustitre,
      thematique_principale: article.thematique_principale,
      thematiques: article.thematiques,
      image_url: article.image_url,
    };
  }
}
