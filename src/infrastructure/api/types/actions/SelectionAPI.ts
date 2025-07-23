import { ApiProperty } from '@nestjs/swagger';
import { SelectionDefinition } from '../../../../domain/contenu/SelectionDefinition';

export class SelectionAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() description: string;
  @ApiProperty() image_url: string;

  public static mapToAPI(selection_def: SelectionDefinition): SelectionAPI {
    return {
      code: selection_def.code,
      titre: selection_def.titre,
      description: selection_def.description,
      image_url: selection_def.image_url,
    };
  }
}
