import { ApiProperty } from '@nestjs/swagger';
import { Besoin } from '../../../../../src/domain/aides/besoin';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { Aide } from '../../../../domain/aides/aide';
import { Echelle } from '../../../../domain/aides/echelle';
import { Thematique } from '../../../../domain/thematique/thematique';

export class AideAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty() contenu: string;
  @ApiProperty({ enum: Echelle }) echelle: Echelle;
  @ApiProperty() url_simulateur: string;
  @ApiProperty() url_source: string;
  @ApiProperty() url_demande: string;
  @ApiProperty() derniere_maj: Date;
  @ApiProperty() deja_vue_le: Date;
  @ApiProperty() is_simulateur: boolean;
  @ApiProperty() codes_postaux: string[];
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty({ type: [String] })
  thematiques_label: string[];
  @ApiProperty() montant_max: number;
  @ApiProperty({ enum: Besoin }) besoin: Besoin;
  @ApiProperty() besoin_desc: string;
  @ApiProperty() clicked_demande: boolean;
  @ApiProperty() clicked_infos: boolean;
  @ApiProperty() partenaire_nom: string;
  @ApiProperty() partenaire_url: string;
  @ApiProperty() partenaire_logo_url: string;
  @ApiProperty() est_gratuit: boolean;
  @ApiProperty() like_level: number;

  public static mapToAPI(aide: Aide): AideAPI {
    return {
      content_id: aide.content_id,
      titre: aide.titre,
      contenu: aide.contenu,
      derniere_maj: aide.derniere_maj,
      url_simulateur: aide.url_simulateur,
      url_source: aide.url_source,
      url_demande: aide.url_demande,
      is_simulateur: aide.is_simulateur,
      codes_postaux: aide.codes_postaux,
      thematiques: aide.thematiques,
      thematiques_label: aide.thematiques.map((elem) =>
        ThematiqueRepository.getTitreThematique(elem),
      ),
      montant_max: aide.montant_max,
      besoin_desc: aide.besoin_desc,
      besoin: aide.besoin,
      clicked_demande: aide.clicked_demande,
      clicked_infos: aide.clicked_infos,
      partenaire_nom: aide.partenaire_nom,
      partenaire_url: aide.partenaire_url,
      partenaire_logo_url: aide.partenaire_logo_url,
      echelle: Echelle[aide.echelle],
      est_gratuit: aide.est_gratuit,
      deja_vue_le: aide.vue_at,
      like_level: aide.like_level,
    };
  }
}
