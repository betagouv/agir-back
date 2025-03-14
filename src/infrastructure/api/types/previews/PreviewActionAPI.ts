import { ApiProperty } from '@nestjs/swagger';
import { Action } from '../../../../domain/actions/action';
import { ActionAPI } from '../actions/ActionAPI';

export class PreviewActionAPI {
  @ApiProperty({ type: ActionAPI }) action: ActionAPI;
  @ApiProperty({ type: Object }) metadata: object;

  public static mapToAPI(preview: {
    action: Action;
    data: object;
  }): PreviewActionAPI {
    return {
      action: ActionAPI.mapToAPI(preview.action),
      metadata: preview.data,
    };
  }
}
