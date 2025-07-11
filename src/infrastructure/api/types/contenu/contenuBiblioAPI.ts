import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../../../src/domain/contenu/contentType';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import {
  Bibliotheque,
  ContenuBibliotheque,
  ThematiqueFilter,
} from '../../../../domain/contenu/bibliotheque';
import {
  SousThematique,
  SousThematiqueHelper,
} from '../../../../domain/thematique/sousThematique';
import { Thematique } from '../../../../domain/thematique/thematique';
import { SousThematiqueRepository } from '../../../repository/sousThematique.repository';

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
}
export class SousThematiqueFiltereAPI {
  @ApiProperty({ enum: SousThematique }) code: SousThematique;
  @ApiProperty() label: string;
  @ApiProperty() selected: boolean;

  public static mapToAPI(
    filtres: Map<SousThematique, ThematiqueFilter>,
  ): SousThematiqueFiltereAPI[] {
    const result: SousThematiqueFiltereAPI[] = [];
    for (const [key, value] of filtres) {
      result.push({
        code: key,
        label: SousThematiqueRepository.getLabel(key),
        selected: value.selected,
      });
    }
    return result;
  }
}

export class ThematiqueFiltereAPI {
  @ApiProperty({ enum: Thematique }) code: Thematique;
  @ApiProperty() label: string;
  @ApiProperty() selected: boolean;
  @ApiProperty({ type: [SousThematiqueFiltereAPI] })
  liste_sous_thematiques: SousThematiqueFiltereAPI[];

  public static mapToAPI(
    filtres_thematique: Map<Thematique, ThematiqueFilter>,
    filtres_sous_thematique: Map<SousThematique, ThematiqueFilter>,
  ): ThematiqueFiltereAPI[] {
    const result: ThematiqueFiltereAPI[] = [];
    for (const entry of filtres_thematique) {
      const thematique = entry[0];
      const them_filter = entry[1];
      const item = {
        code: thematique,
        label: ThematiqueRepository.getTitreThematique(thematique),
        selected: them_filter.selected,
        liste_sous_thematiques: [],
      };
      if (filtres_sous_thematique) {
        for (const entry2 of filtres_sous_thematique) {
          const sous_thematique = entry2[0];
          const sous_them_filter = entry2[1];
          const them_parent =
            SousThematiqueHelper.getThematique(sous_thematique);
          if (them_parent === thematique) {
            const sous_them: SousThematiqueFiltereAPI = {
              code: sous_thematique,
              label: SousThematiqueRepository.getLabel(sous_thematique),
              selected: sous_them_filter.selected,
            };
            item.liste_sous_thematiques.push(sous_them);
          }
        }
      }
      result.push(item);
    }
    return result;
  }
}
export class BibliothequeAPI {
  @ApiProperty({ type: [ContenuBibliothequeAPI] })
  contenu: ContenuBibliothequeAPI[];
  @ApiProperty({ type: [ThematiqueFiltereAPI] })
  filtres: ThematiqueFiltereAPI[];

  @ApiProperty() nombre_resultats: number;
  @ApiProperty() nombre_resultats_disponibles: number;

  public static mapToAPI(biblio: Bibliotheque): BibliothequeAPI {
    return {
      contenu: biblio
        .getAllContenu()
        .map((content) => ContenuBibliothequeAPI.mapToAPI(content)),
      filtres: ThematiqueFiltereAPI.mapToAPI(
        biblio.filtre_thematiques,
        undefined,
      ),
      nombre_resultats: biblio.getNombreResultats(),
      nombre_resultats_disponibles: biblio.getNombreResultatsDispo(),
    };
  }
}
