import { ApiProperty } from '@nestjs/swagger';
import {
  CategorieRecherche,
  CategorieRechercheLabels,
} from '../../../../domain/bibliotheque_services/categorieRecherche';

export class CategoriesRechercheAPI {
  @ApiProperty({ enum: CategorieRecherche }) code: CategorieRecherche;
  @ApiProperty() label: string;

  public static mapToAPI(cat: CategorieRecherche): CategoriesRechercheAPI {
    return {
      code: cat,
      label: CategorieRechercheLabels.getLabel(cat),
    };
  }
}
