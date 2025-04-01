import { ApiProperty } from '@nestjs/swagger';

export class CompteutActionAPI {
  @ApiProperty()
  nombre_total_actions_faites: number;

  public static map(total_actions_faites: number): CompteutActionAPI {
    return {
      nombre_total_actions_faites: total_actions_faites,
    };
  }
}
