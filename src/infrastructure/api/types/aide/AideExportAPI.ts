import { ApiProperty } from '@nestjs/swagger';
import { AideExport } from '../../../../domain/aides/aideExport';

export class EPCI_AIDE_EXPORT_API {
  @ApiProperty() code_siren_epci: string;
  @ApiProperty() nom_epci: string;
  @ApiProperty() nature_epci: string;
  @ApiProperty() codes_commune_manquants: string;
  @ApiProperty() codes_commune_qui_matchent: string;
}
export class EPCI_AIDE_EXPORT_PARTENAIRE_API {
  @ApiProperty() id_cms: string;
  @ApiProperty() nom: string;
  @ApiProperty() code_epci: string;
  @ApiProperty() code_commune: string;
  @ApiProperty() echelle: string;
  @ApiProperty() type_epci: string;
}

export class AideExportAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty() echelle: string;
  @ApiProperty() url_source: string;
  @ApiProperty() url_demande: string;
  @ApiProperty() codes_postaux: string;
  @ApiProperty()
  thematiques: string;
  @ApiProperty() codes_departement: string;
  @ApiProperty() codes_region: string;
  @ApiProperty() liste_codes_communes: string;
  @ApiProperty() est_grand_est: boolean;
  @ApiProperty({ type: [EPCI_AIDE_EXPORT_API] })
  liste_EPCI: EPCI_AIDE_EXPORT_API[];
  @ApiProperty({ type: [EPCI_AIDE_EXPORT_PARTENAIRE_API] })
  liste_partenaires: EPCI_AIDE_EXPORT_PARTENAIRE_API[];

  public static mapToAPI(aide: AideExport): AideExportAPI {
    return {
      content_id: aide.content_id,
      titre: aide.titre,
      codes_postaux: aide.codes_postaux.join('|'),
      thematiques: aide.thematiques.join('|'),
      codes_departement: aide.codes_departement.join('|'),
      codes_region: aide.codes_region.join('|'),
      echelle: aide.echelle,
      url_source: aide.url_source,
      url_demande: aide.url_demande,
      liste_codes_communes: aide.liste_codes_communes.join('|'),
      liste_partenaires: aide.liste_partenaires.map((p) => ({
        id_cms: p.id_cms,
        nom: p.nom,
        code_commune: p.code_commune,
        code_epci: p.code_epci,
        echelle: p.echelle,
        type_epci: p.type_epci,
      })),
      liste_EPCI: aide.liste_EPCI.map((e) => ({
        code_siren_epci: e.code_siren_epci,
        nom_epci: e.nom_epci,
        nature_epci: e.nature_epci,
        codes_commune_manquants: e.codes_commune_manquants.join('|'),
        codes_commune_qui_matchent: e.codes_commune_qui_matchent.join('|'),
      })),
      est_grand_est: aide.est_grand_est,
    };
  }
}
