import { ApiProperty } from '@nestjs/swagger';

export class ArticleAPI {
  @ApiProperty() id?: string;
  @ApiProperty() titre: string;
  @ApiProperty() contenu: string;
}
