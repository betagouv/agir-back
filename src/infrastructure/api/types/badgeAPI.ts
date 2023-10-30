import { ApiProperty } from '@nestjs/swagger';
import { Badge } from '../../../../src/domain/badge/badge';

export class BadgeAPI {
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
  @ApiProperty() created_at: Date;

  static mapBadgeToBadgeAPI(badge: Badge): BadgeAPI {
    return {
      titre: badge.titre,
      type: badge.type,
      created_at: badge.created_at,
    };
  }
}
