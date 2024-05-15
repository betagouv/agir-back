import { ApiProperty } from '@nestjs/swagger';

export class MissionAPI {
  @ApiProperty() titre: string;

  public static mapToAPI(mission: any): MissionAPI {
    return {
      titre: mission.titre,
    };
  }
}
