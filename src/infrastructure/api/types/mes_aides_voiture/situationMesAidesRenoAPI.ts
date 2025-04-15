import { ApiProperty } from '@nestjs/swagger';

export class SituationMesAidesRenoAPI {
  @ApiProperty({
    description:
      'Un objet de type clé/valeur contenant les données de la situation renvoyée par Mes Aides Reno.',
    type: Object,
  })
  situation: Record<string, string>;
}
