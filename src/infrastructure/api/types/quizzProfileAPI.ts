import { ApiProperty } from '@nestjs/swagger';

export class QuizzLevelAPI {
  @ApiProperty()
  level: number;

  @ApiProperty()
  isCompleted: boolean;
}
export class QuizzProfileAPI {
  @ApiProperty({ type: QuizzLevelAPI })
  alimentation: QuizzLevelAPI;

  @ApiProperty({ type: QuizzLevelAPI })
  climat: QuizzLevelAPI;

  @ApiProperty({ type: QuizzLevelAPI })
  transport: QuizzLevelAPI;

  @ApiProperty({ type: QuizzLevelAPI })
  logement: QuizzLevelAPI;

  @ApiProperty({ type: QuizzLevelAPI })
  consommation: QuizzLevelAPI;

  @ApiProperty({ type: QuizzLevelAPI })
  dechet: QuizzLevelAPI;

  @ApiProperty({ type: QuizzLevelAPI })
  loisir: QuizzLevelAPI;
}
