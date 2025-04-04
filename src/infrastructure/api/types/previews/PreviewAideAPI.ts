import { ApiProperty } from '@nestjs/swagger';
import { Aide } from '../../../../domain/aides/aide';
import { AideAPI } from '../aide/AideAPI';

export class PreviewAideAPI {
  @ApiProperty({ type: AideAPI }) aide: AideAPI;
  @ApiProperty({ type: Object }) metadata: object;

  public static mapToAPI(preview: {
    aide: Aide;
    data: object;
  }): PreviewAideAPI {
    return {
      aide: AideAPI.mapToAPI(preview.aide),
      metadata: preview.data,
    };
  }
}
