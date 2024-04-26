import { ApiProperty } from '@nestjs/swagger';

export class EmailAPI {
  @ApiProperty({ type: String })
  email: string;

  public static mapToAPI(email: string): EmailAPI {
    return {
      email: email,
    };
  }
}
