import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/contenu/thematique';

export class SourceArticleAPI {
  label: string;
  url: string;
}

export class ArticleBibliothequeAPI {
  @ApiProperty() titre: string;
  @ApiProperty() soustitre: string;
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques?: Thematique[];
  @ApiProperty() image_url: string;
  @ApiProperty({ enum: Thematique }) thematique_principale: Thematique;
  @ApiProperty() thematique_principale_label: string;
  @ApiProperty() points: number;
  @ApiProperty() content_id: string;
  @ApiProperty() favoris: boolean;
  @ApiProperty() like_level: number;
  @ApiProperty() read_date: Date;
  @ApiProperty() contenu: string;
  @ApiProperty() partenaire_nom: string;
  @ApiProperty() partenaire_url: string;
  @ApiProperty() partenaire_logo_url: string;
  @ApiProperty({ type: [SourceArticleAPI] }) sources: SourceArticleAPI[];
}
