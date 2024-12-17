export type ImageUrlAPI = {
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
export type ImageUrlAPI2 = {
  attributes: {
    url: string;
    formats: {
      thumbnail: {
        url: string;
      };
    };
  };
};

export type CMSWebhookPopulateAPI = {
  id: number;
  attributes: {
    contenu: string;
    nom: string;
    lien: string;
    titre: string;
    introduction: string;
    label: string;
    sousTitre: string;
    astuces: string;
    type: string;
    categorie: string;
    echelle: string;
    url_source: string;
    url_demande: string;
    A_SUPPRIMER: boolean;
    is_ngc: boolean;
    is_first: boolean;
    is_examen: boolean;
    ngc_key: string;
    code: string;
    niveau: number;
    question: string;
    short_question: string;
    pourquoi: string;
    description: string;
    source: string;
    sources: [
      {
        id: number;
        libelle: string;
        lien: string;
      },
    ];
    articles: {
      data: [
        {
          id: number;
        },
      ];
    };
    questions: [
      {
        id: number;
        libelle: string;
        explicationOk: string;
        explicationKO: string;
        reponses: [{ id: number; reponse: string; exact: boolean }];
      },
    ];

    codes_postaux: string;
    mois: string;
    include_codes_commune: string;
    exclude_codes_commune: string;
    codes_departement: string;
    codes_region: string;
    duree: string;
    frequence: string;
    points: number;
    unite: string;
    emoji: string;
    impact_kg_co2: number;
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

    thematiques: {
      data: [
        {
          id: number;
          attributes: {
            code: string;
          };
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
    thematique: {
      data: {
        id: number;
        attributes: {
          code: string;
        };
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

    imageUrl: ImageUrlAPI;
    logo: { data: ImageUrlAPI2[] };

    partenaire: {
      data: {
        id: number;
        attributes: {
          nom: string;
          lien: string;
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
