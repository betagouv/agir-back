import { ApiProperty } from '@nestjs/swagger';

export class OnboardingAPI {
  @ApiProperty()
  current: number;
  @ApiProperty()
  target: number;
  @ApiProperty()
  current_label: string;
  @ApiProperty()
  is_done: boolean;

  public static mapToAPI(
    current: number,
    target: number,
    current_label: string,
    is_done: boolean,
  ): OnboardingAPI {
    return {
      current,
      target,
      current_label,
      is_done,
    };
  }
}
