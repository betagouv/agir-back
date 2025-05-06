import { ApiProperty } from '@nestjs/swagger';

export class MesAidesRenoIframeUrlsAPI {
  @ApiProperty({
    description: "Url de l'iframe avec les réponses préremplies.",
  })
  iframe_url: string;

  @ApiProperty({
    description:
      "Url de l'iframe avec les réponses préremplies et répondues. C'est-à-dire que toutes les questions préremplies ne seront pas posées, à utiliser pour aller directement au résultat lorsque l'action est déjà faite.",
  })
  iframe_url_deja_faite: string;
}
