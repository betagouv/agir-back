import { ApiProperty } from '@nestjs/swagger';

export class AidesVeloParTypeAPI {
  @ApiProperty() 'mécanique simple': number;
  @ApiProperty() 'électrique': number;
  @ApiProperty() 'cargo': number;
  @ApiProperty() 'cargo électrique': number;
  @ApiProperty() 'pliant': number;
  @ApiProperty() 'motorisation': number;
}
