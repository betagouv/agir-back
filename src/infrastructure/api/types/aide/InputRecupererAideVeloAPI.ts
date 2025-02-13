import { ApiProperty } from '@nestjs/swagger';

export class InputRecupererAideVeloAPI {
  @ApiProperty({
    description: "Code INSEE de la commune ou SIREN de l'EPCI",
    required: true,
  })
  code_insee_ou_siren: string;
}
