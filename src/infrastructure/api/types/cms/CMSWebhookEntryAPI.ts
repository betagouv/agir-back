import { ApiProperty } from '@nestjs/swagger';
import { CMSTagAPI } from './CMSTagAPI';
import { CMSThematiqueAPI } from './CMSThematiqueAPI';
import { CMSWebhookImageURLAPI } from './CMSWebhookImageURLAPI';

export class CMSWebhookBesoinAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
  @ApiProperty() description: string;
}
export class CMSWebhookUniversAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
}
export class CMSWebhookThematiqueUniversAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
}
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
  @ApiProperty() code: string;
  @ApiProperty() label: string;
  @ApiProperty({ type: CMSWebhookUniversAPI })
  univers_parent: CMSWebhookUniversAPI;
  @ApiProperty() sousTitre: string;
  @ApiProperty() description: string;
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique_gamification: CMSThematiqueAPI;
  @ApiProperty({ type: [CMSThematiqueAPI] })
  thematiques: CMSThematiqueAPI[];
  @ApiProperty({ type: [CMSWebhookUniversAPI] })
  univers: CMSWebhookUniversAPI[];
  @ApiProperty({ type: [CMSWebhookThematiqueUniversAPI] })
  thematique_univers: CMSWebhookThematiqueUniversAPI[];
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique: CMSThematiqueAPI;
  @ApiProperty({ type: [CMSTagAPI] })
  tags: CMSTagAPI[];
  @ApiProperty({ type: [CMSWebhookRubriqueAPI] })
  rubriques: CMSWebhookRubriqueAPI[];
  @ApiProperty({ type: CMSWebhookPartenaireAPI })
  partenaire: CMSWebhookPartenaireAPI;
  @ApiProperty({ type: CMSWebhookBesoinAPI })
  besoin: CMSWebhookBesoinAPI;
  @ApiProperty() duree: string;
  @ApiProperty() astuces: string;
  @ApiProperty() pourquoi: string;
  @ApiProperty() source: string;
  @ApiProperty() frequence: string;
  @ApiProperty({ type: CMSWebhookImageURLAPI }) imageUrl: CMSWebhookImageURLAPI;
  @ApiProperty() difficulty: number;
  @ApiProperty() points?: number;
  @ApiProperty() codes_postaux?: string;
  @ApiProperty() publishedAt: Date;
  @ApiProperty() url_detail_front: string;
  @ApiProperty() is_simulation: boolean;
  @ApiProperty() montantMaximum: string;
}
export type CMSWebhookPopulateAPI = {
  id: number;
  attributes: {
    titre: string;
    sousTitre: string;
    astuces: string;
    type: string;
    categorie: string;
    is_ngc: boolean;
    code: string;
    question: string;
    pourquoi: string;
    description: string;
    source: string;
    codes_postaux: string;
    duree: string;
    frequence: string;
    points: number;
    difficulty: number;
    publishedAt: string;
    is_simulation: boolean;
    montantMaximum: string;
    est_visible: boolean;
    url_detail_front: string;
    thematique_univers_unique: {
      data: {
        id: number;
        attributes: {
          code: string;
        };
      };
    };

    prochaines_thematiques: {
      data: [
        {
          id: number;
          attributes: {
            code: string;
          };
        },
      ];
    };
    thematiques: {
      data: [
        {
          id: number;
        },
      ];
    };
    tags: {
      data: [
        {
          attributes: {
            code: string;
          };
        },
      ];
    };
    thematique_gamification: {
      data: {
        id: number;
      };
    };
    thematique: {
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
    besoin: {
      data: {
        attributes: {
          code: string;
          description: string;
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
    univers: {
      data: [
        {
          id: string;
          attributes: {
            code: string;
          };
        },
      ];
    };
    thematique_univers: {
      data: [
        {
          id: string;
          attributes: {
            code: string;
          };
        },
      ];
    };
    reponses: [
      {
        reponse: string;
        code: string;
      },
    ];
    objectifs: [
      {
        id: number;
        titre: string;
        points: number;
        article: {
          data: {
            id: number;
          };
        };
        quizz: {
          data: {
            id: number;
          };
        };
        defi: {
          data: {
            id: number;
          };
        };
        kyc: {
          data: {
            id: number;
            attributes: {
              code: string;
            };
          };
        };
      },
    ];
  };
};
