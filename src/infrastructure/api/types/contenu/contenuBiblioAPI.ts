import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../../../src/domain/contenu/contentType';
import {
  Bibliotheque,
  ContenuBibliotheque,
  ThematiqueFilter,
} from '../../../../domain/contenu/bibliotheque';
import { Thematique } from '../../../../domain/contenu/thematique';
import { Article } from '../../../../domain/contenu/article';

export class ContenuBibliothequeAPI {
  @ApiProperty({ enum: ContentType }) type: ContentType;
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
  @ApiProperty() like_level?: number;
  @ApiProperty() read_date?: Date;

  public static mapToAPI(content: ContenuBibliotheque): ContenuBibliothequeAPI {
    return {
      content_id: content.content_id,
      type: content.type,
      titre: content.titre,
      soustitre: content.soustitre,
      thematique_principale: content.thematique_principale,
      thematique_principale_label: ThematiqueRepository.getTitreThematique(
        content.thematique_principale,
      ),
      thematiques: content.thematiques,
      image_url: content.image_url,
      points: content.points,
      favoris: content.favoris,
      like_level: content.like_level,
      read_date: content.read_date,
    };
  }
  public static mapArticleToAPI(content: Article): ContenuBibliothequeAPI {
    return {
      content_id: content.content_id,
      type: ContentType.article,
      titre: content.titre,
      soustitre: content.soustitre,
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
    };
  }
}

export class ThematiqueFiltereAPI {
  @ApiProperty({ enum: Thematique }) code: Thematique;
  @ApiProperty() label: string;
  @ApiProperty() selected: boolean;

  public static mapToAPI(
    filtres: Map<Thematique, ThematiqueFilter>,
  ): ThematiqueFiltereAPI[] {
    const result: ThematiqueFiltereAPI[] = [];
    for (const entry of filtres) {
      result.push({
        code: entry[0],
        label: ThematiqueRepository.getTitreThematique(entry[0]),
        selected: entry[1].selected,
      });
    }
    return result;
  }
}
export class BibliothequeAPI {
  @ApiProperty({ type: [ContenuBibliothequeAPI] })
  contenu: ContenuBibliothequeAPI[];
  @ApiProperty({ type: [ThematiqueFiltereAPI] })
  filtres: ThematiqueFiltereAPI[];

  public static mapToAPI(biblio: Bibliotheque): BibliothequeAPI {
    return {
      contenu: biblio
        .getAllContenu()
        .map((content) => ContenuBibliothequeAPI.mapToAPI(content)),
      filtres: ThematiqueFiltereAPI.mapToAPI(biblio.filtre_thematiques),
    };
  }
}
