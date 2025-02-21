import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/thematique/thematique';
import { Defi, DefiStatus } from '../../../../../src/domain/defis/defi';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { DefiStatistique } from '../../../../../src/domain/defis/defiStatistique';

export class PatchDefiStatusAPI {
  @ApiProperty({ enum: DefiStatus }) status: DefiStatus;
  @ApiProperty() motif: string;
}

export class DefiAPI {
  @ApiProperty() id: string;
  @ApiProperty() points: number;
  @ApiProperty() titre: string;
  @ApiProperty() motif: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() pourquoi: string;
  @ApiProperty() astuces: string;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() thematique_label: string;
  @ApiProperty({ enum: DefiStatus }) status: DefiStatus;
  @ApiProperty() jours_restants: number;
  @ApiProperty() nombre_de_fois_realise: number;

  public static mapToAPI(
    defi: Defi,
    defiStatistique?: DefiStatistique,
  ): DefiAPI {
    return {
      id: defi.id,
      astuces: defi.astuces,
      jours_restants: defi.getJourRestants(),
      points: defi.points,
      pourquoi: defi.pourquoi,
      sous_titre: defi.sous_titre,
      status: defi.getStatus(),
      thematique: defi.thematique,
      thematique_label: ThematiqueRepository.getLibelleThematique(
        defi.thematique,
      ),
      titre: defi.titre,
      motif: defi.motif,
      nombre_de_fois_realise: defiStatistique
        ? defiStatistique.nbr_realise
        : undefined,
    };
  }
}
