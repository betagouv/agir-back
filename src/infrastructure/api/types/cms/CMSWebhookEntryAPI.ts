import { ApiProperty } from '@nestjs/swagger';
import { CMSTagAPI } from './CMSTagAPI';
import { CMSThematiqueAPI } from './CMSThematiqueAPI';
import { CMSWebhookImageURLAPI } from './CMSWebhookImageURLAPI';

export class IDAPI {
  @ApiProperty() id: number;
}
export class CodeAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
}

export class CMSWebhookBesoinAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
  @ApiProperty() description: string;
}
export class CMSWebhookFamilleAPI {
  @ApiProperty() id: number;
  @ApiProperty() nom: string;
  @ApiProperty() ordre: number;
}
export class CMSWebhookObjectifAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
  @ApiProperty() points: number;
  @ApiProperty({ type: IDAPI }) article: IDAPI;
  @ApiProperty({ type: IDAPI }) defi: IDAPI;
  @ApiProperty({ type: IDAPI }) quizz: IDAPI;
  @ApiProperty({ type: CodeAPI }) kyc: CodeAPI;
  @ApiProperty({ type: CodeAPI }) mosaic: CodeAPI;
  @ApiProperty({ type: CodeAPI }) tag_article: CodeAPI;
}
export class CMSWebhookReponseKYCAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
  @ApiProperty() ngc_code: string;
  @ApiProperty() reponse: string;
}
export class AndConditionAPI {
  @ApiProperty() code_reponse: string;
  @ApiProperty({ type: CMSWebhookReponseKYCAPI }) kyc: CMSWebhookReponseKYCAPI;
}
export class OrConditionAPI {
  @ApiProperty({ type: [AndConditionAPI] }) AND_Conditions: AndConditionAPI[];
}
export class CMSWebhookUniversAPI {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
}

export class CMSTagArticleAPI {
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
  @ApiProperty() est_visible: boolean;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() include_codes_commune: string;
  @ApiProperty() exclude_codes_commune: string;
  @ApiProperty() codes_departement: string;
  @ApiProperty() codes_region: string;
  @ApiProperty() categorie: string;
  @ApiProperty() type: string;
  @ApiProperty() label: string;
  @ApiProperty() question: string;
  @ApiProperty() short_question: string;
  @ApiProperty() niveau: number;
  @ApiProperty({ type: CMSWebhookFamilleAPI })
  famille: CMSWebhookFamilleAPI;
  @ApiProperty({ type: [OrConditionAPI] }) OR_Conditions: OrConditionAPI[];
  @ApiProperty({ type: [CMSWebhookReponseKYCAPI] })
  reponses: CMSWebhookReponseKYCAPI[];
  @ApiProperty({ type: CMSWebhookUniversAPI })
  univers_parent: CMSWebhookUniversAPI;
  @ApiProperty() sousTitre: string;
  @ApiProperty() description: string;
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique_gamification: CMSThematiqueAPI;

  @ApiProperty({ type: CMSTagArticleAPI })
  tag_article: CMSTagArticleAPI;

  @ApiProperty({ type: [CMSThematiqueAPI] })
  thematiques: CMSThematiqueAPI[];
  @ApiProperty({ type: [CMSWebhookUniversAPI] })
  univers: CMSWebhookUniversAPI[];
  @ApiProperty({ type: [CMSWebhookThematiqueUniversAPI] })
  thematique_univers: CMSWebhookThematiqueUniversAPI[];
  @ApiProperty({ type: CMSWebhookThematiqueUniversAPI })
  thematique_univers_unique: CMSWebhookThematiqueUniversAPI;

  @ApiProperty({ type: [CMSWebhookObjectifAPI] })
  objectifs: CMSWebhookObjectifAPI[];

  @ApiProperty({ type: [CMSWebhookThematiqueUniversAPI] })
  prochaines_thematiques: CMSWebhookThematiqueUniversAPI[];
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
  @ApiProperty() mois?: string;
  @ApiProperty() publishedAt: Date;
  @ApiProperty() url_detail_front: string;
  @ApiProperty() is_simulation: boolean;
  @ApiProperty() is_ngc: boolean;
  @ApiProperty() ngc_key: string;
  @ApiProperty() montantMaximum: string;
}
export type CMSWebhookPopulateAPI = {
  id: number;
  attributes: {
    contenu: string;
    titre: string;
    label: string;
    sousTitre: string;
    astuces: string;
    type: string;
    categorie: string;
    is_ngc: boolean;
    ngc_key: string;
    is_locked: boolean;
    code: string;
    niveau: number;
    question: string;
    short_question: string;
    pourquoi: string;
    description: string;
    source: string;
    codes_postaux: string;
    mois: string;
    include_codes_commune: string;
    exclude_codes_commune: string;
    codes_departement: string;
    codes_region: string;
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
    tag_article: {
      data: {
        attributes: {
          code: string;
        };
      };
    };
    thematique: {
      data: {
        id: number;
      };
    };
    famille: {
      data: {
        id: number;
        attributes: {
          ordre: number;
        };
      };
    };
    univers_parent: {
      data: {
        id: number;
        attributes: {
          code: string;
        };
      };
    };

    imageUrl: {
      data: {
        attributes: {
          url: string;
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
          id: number;
          attributes: {
            titre: string;
          };
        },
      ];
    };
    univers: {
      data: [
        {
          id: number;
          attributes: {
            code: string;
          };
        },
      ];
    };
    thematique_univers: {
      data: [
        {
          id: number;
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
        ngc_code: string;
      },
    ];
    OR_Conditions: [
      {
        AND_Conditions: [
          {
            code_reponse: string;
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
        mosaic: {
          data: {
            id: number;
            attributes: {
              code: string;
            };
          };
        };
        tag_article: {
          data: {
            attributes: {
              code: string;
            };
          };
        };
      },
    ];
  };
};
