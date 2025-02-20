import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { AideDefinition } from '../../../../domain/aides/aideDefinition';
import { Thematique } from '../../../../domain/thematique/thematique';
import { Besoin } from '../../../../../src/domain/aides/besoin';
import { PartenaireDefinition } from '../../../../domain/contenu/partenaireDefinition';
import { PartenaireRepository } from '../../../repository/partenaire.repository';
import { EchelleAide } from '../../../../domain/aides/echelle';

export class AideAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty() contenu: string;
  @ApiProperty({ enum: EchelleAide }) echelle: EchelleAide;
  @ApiProperty() url_simulateur: string;
  @ApiProperty() url_source: string;
  @ApiProperty() url_demande: string;
  @ApiProperty() derniere_maj: Date;
  @ApiProperty() is_simulateur: boolean;
  @ApiProperty() codes_postaux: string[];
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty({ type: [String] })
  thematiques_label: string[];
  @ApiProperty() montant_max: number;
  @ApiProperty() besoin: Besoin;
  @ApiProperty() besoin_desc: string;
  @ApiProperty() clicked_demande: boolean;
  @ApiProperty() clicked_infos: boolean;
  @ApiProperty() partenaire_nom: string;
  @ApiProperty() partenaire_url: string;
  @ApiProperty() partenaire_logo_url: string;
  @ApiProperty() est_gratuit: boolean;

  public static mapToAPI(aide: AideDefinition): AideAPI {
    let partenaire: PartenaireDefinition;
    if (aide.partenaire_id) {
      partenaire = PartenaireRepository.getPartenaire(aide.partenaire_id);
    }
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
      partenaire_nom: partenaire ? partenaire.nom : null,
      partenaire_url: partenaire ? partenaire.url : null,
      partenaire_logo_url: partenaire ? partenaire.image_url : null,
      echelle: EchelleAide[aide.echelle],
      est_gratuit: aide.est_gratuit,
    };
  }
}
