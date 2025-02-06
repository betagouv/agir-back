import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/contenu/thematique';
import { PartenaireDefinition } from '../../../../domain/contenu/partenaireDefinition';
import { PartenaireRepository } from '../../../repository/partenaire.repository';
import { ThematiqueRepository } from '../../../repository/thematique.repository';
import { Article } from '../../../../domain/contenu/article';

export class SourceArticleAPI {
  @ApiProperty() label: string;
  @ApiProperty() url: string;
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
  @ApiProperty() derniere_maj: Date;
  @ApiProperty() contenu: string;
  @ApiProperty() partenaire_nom: string;
  @ApiProperty() partenaire_url: string;
  @ApiProperty() partenaire_logo_url: string;
  @ApiProperty({ type: [SourceArticleAPI] }) sources: SourceArticleAPI[];

  public static mapArticleToAPI(content: Article): ArticleBibliothequeAPI {
    let partenaire: PartenaireDefinition;
    if (content.partenaire_id) {
      partenaire = PartenaireRepository.getPartenaire(content.partenaire_id);
    }
    return {
      content_id: content.content_id,
      titre: content.titre,
      soustitre: content.soustitre,
      derniere_maj: content.derniere_maj,
      thematique_principale: content.thematique_principale,
      thematique_principale_label: ThematiqueRepository.getLibelleThematique(
        content.thematique_principale,
      ),
      thematiques: content.thematiques,
      image_url: content.image_url,
      points: content.points,
      favoris: content.favoris,
      like_level: content.like_level,
      read_date: content.read_date,
      contenu: content.contenu,
      partenaire_nom: partenaire ? partenaire.nom : null,
      partenaire_url: partenaire ? partenaire.url : null,
      partenaire_logo_url: partenaire ? partenaire.image_url : null,
      sources: content.sources
        ? content.sources.map((s) => ({
            label: s.label,
            url: s.url,
          }))
        : [],
    };
  }
}
