import { ApiProperty } from '@nestjs/swagger';
import { Badge } from '../../../../src/domain/badge/badge';

export class BadgeAPI {
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
  @ApiProperty() created_at: Date;

  static mapServicesToBadgesAPI(badges: Badge[]): BadgeAPI[] {
    if (!badges) return [];
    return badges.map((badge) => {
      return {
        titre: badge.titre,
        type: badge.type,
        created_at: badge.created_at,
      } as BadgeAPI;
    });
  }
}
