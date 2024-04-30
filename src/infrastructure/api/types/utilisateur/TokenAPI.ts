import { ApiProperty } from '@nestjs/swagger';

export class TokenAPI {
  @ApiProperty({ type: String })
  token: string;

  public static mapToAPI(token: string): TokenAPI {
    return {
      token: token,
    };
  }
}
