import { ApiProperty } from '@nestjs/swagger';
import {
  CategorieRecherche,
  CategorieRechercheManager,
} from '../../../../domain/bibliotheque_services/categorieRecherche';

export class CategoriesRechercheAPI {
  @ApiProperty({ enum: CategorieRecherche }) code: CategorieRecherche;
  @ApiProperty() label: string;
  @ApiProperty() is_default: boolean;

  public static mapToAPI(cat: CategorieRecherche): CategoriesRechercheAPI {
    return {
      code: cat,
      label: CategorieRechercheManager.getLabel(cat),
      is_default: CategorieRechercheManager.isDefault(cat),
    };
  }
}
