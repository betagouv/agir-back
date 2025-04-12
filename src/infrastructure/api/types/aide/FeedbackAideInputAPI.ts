import { ApiProperty } from '@nestjs/swagger';

export class FeedbackAideInputAPI {
  @ApiProperty({ required: false })
  like_level: number;

  @ApiProperty({ required: false })
  feedback: string;

  @ApiProperty({ required: false })
  est_connue_utilisateur: boolean;
  @ApiProperty({ required: false })
  sera_sollicitee_utilisateur: boolean;
}
