import { ApiProperty } from '@nestjs/swagger';
import { ConformiteDefinition } from '../../../../domain/contenu/conformiteDefinition';

export class ConformiteAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() contenu: string;

  public static mapToAPI(confo_def: ConformiteDefinition): ConformiteAPI {
    return {
      content_id: confo_def.content_id,
      titre: confo_def.titre,
      contenu: confo_def.contenu,
      code: confo_def.code,
    };
  }
}
