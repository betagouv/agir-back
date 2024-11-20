import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueDefinition } from '../../../../domain/thematique/thematiqueDefinition';

// FIXME : A SUPPRIMER
export class UniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
  @ApiProperty() etoiles: number;
  @ApiProperty() image_url: string;
  @ApiProperty() is_done: boolean;

  public static mapToAPI(uni: ThematiqueDefinition): UniversAPI {
    return {
      titre: uni.label,
      etoiles: 0,
      type: uni.code,
      image_url: uni.image_url,
      is_done: false,
    };
  }
}
