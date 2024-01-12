import { ApiProperty } from '@nestjs/swagger';

export class LoggedUtilisateurAPI {
  @ApiProperty({ type: String })
  token: string;

  public static mapToAPI(token: string): LoggedUtilisateurAPI {
    return {
      token: token,
    };
  }
}
