import { ApiProperty } from '@nestjs/swagger';
import { CMSThematiqueAPI } from './CMSThematiqueAPI';
import { CMSWebhookImageURLAPI } from './CMSWebhookImageURLAPI';

export class CMSWebhookRubriqueAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
}
export class CMSWebhookPartenaireAPI {
  @ApiProperty() id: number;
  @ApiProperty() nom: string;
}
export class CMSWebhookEntryAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
  @ApiProperty() sousTitre: string;
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique_gamification: CMSThematiqueAPI;
  @ApiProperty({ type: [CMSThematiqueAPI] })
  thematiques: CMSThematiqueAPI[];
  @ApiProperty({ type: [CMSWebhookRubriqueAPI] })
  rubriques: CMSWebhookRubriqueAPI[];
  @ApiProperty({ type: CMSWebhookPartenaireAPI })
  partenaire: CMSWebhookPartenaireAPI;
  @ApiProperty() duree: string;
  @ApiProperty() source: string;
  @ApiProperty() frequence: string;
  @ApiProperty({ type: CMSWebhookImageURLAPI }) imageUrl: CMSWebhookImageURLAPI;
  @ApiProperty() difficulty: number;
  @ApiProperty() points?: number;
  @ApiProperty() codes_postaux?: string;
  @ApiProperty() publishedAt: Date;
}
export type CMSWebhookPopulateAPI = {
  id: number;
  attributes: {
    titre: string;
    sousTitre: string;
    source: string;
    codes_postaux: string;
    duree: string;
    frequence: string;
    points: number;
    difficulty: number;
    publishedAt: string;
    thematiques: {
      data: [
        {
          id: number;
        },
      ];
    };
    thematique_gamification: {
      data: {
        id: number;
      };
    };

    imageUrl: {
      data: {
        attributes: {
          formats: {
            thumbnail: {
              url: string;
            };
          };
        };
      };
    };
    partenaire: {
      data: {
        attributes: {
          nom: string;
        };
      };
    };
    rubriques: {
      data: [
        {
          id: string;
          attributes: {
            titre: string;
          };
        },
      ];
    };
  };
};
