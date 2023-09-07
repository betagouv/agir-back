import { ApiProperty } from '@nestjs/swagger';

export class Badge {
  @ApiProperty()
  titre: string;

  @ApiProperty()
  type: string;
}
