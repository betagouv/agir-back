import { ApiProperty } from '@nestjs/swagger';

export class QuizzQuestionAPI {
  @ApiProperty() id: string;
  @ApiProperty() ordre: string;
  @ApiProperty() libelle: string;
  @ApiProperty() propositions: string[];
  @ApiProperty() solution: string;
  @ApiProperty() texte_riche_ok: string;
  @ApiProperty() texte_riche_ko: string;
}
export class QuizzAPI {
  @ApiProperty() id: string;

  @ApiProperty() titre: string;

  @ApiProperty({ type: [QuizzQuestionAPI] })
  questions: QuizzQuestionAPI[];
}
