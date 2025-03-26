import { ApiProperty } from '@nestjs/swagger';
import {
  CatalogueAction,
  Consultation,
  Realisation,
} from '../../../../domain/actions/catalogueAction';
import { ThematiqueFiltereAPI } from '../contenu/contenuBiblioAPI';
import { ActionLightAPI } from './ActionLightAPI';

export class CatalogueActionAPI {
  @ApiProperty({ type: [ActionLightAPI] })
  actions: ActionLightAPI[];

  @ApiProperty({ type: [ThematiqueFiltereAPI] })
  filtres: ThematiqueFiltereAPI[];

  @ApiProperty({ enum: Consultation }) consultation: Consultation;
  @ApiProperty({ enum: Realisation }) realisation: Realisation;

  public static mapToAPI(catalogue: CatalogueAction): CatalogueActionAPI {
    return {
      actions: catalogue.actions.map((a) => ActionLightAPI.mapToAPI(a)),
      filtres: ThematiqueFiltereAPI.mapToAPI(catalogue.filtre_thematiques),
      consultation: catalogue.consultation,
      realisation: catalogue.realisation,
    };
  }
}
