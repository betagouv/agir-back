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
    external_id;
    consigne: string;
    label_compteur: string;
    texte: string;
    Titre: string;
    introduction: string;
    label: string;
    label_explication: string;
    sousTitre: string;
    sous_titre: string;
    comment: string;
    felicitations: string;
    categorie_recettes: string;
    sous_categorie_recettes: string;
    categorie_pdcn: string;
    objet_lvo: string;
    action_lvo: string;
    type_action: string;
    astuces: string;
    type: string;
    categorie: string;
    echelle: string;
    url_source: string;
    url_demande: string;
    date_expiration: Date;
    derniere_maj: Date;
    A_SUPPRIMER: boolean;
    is_ngc: boolean;
    is_first: boolean;
    is_examen: boolean;
    ngc_key: string;
    code: string;
    boost_absolu: number;
    ponderation: number;
    VISIBLE_PROD: boolean;
    niveau: number;
    question: string;
    reponse: string;
    short_question: string;
    pourquoi: string;
    question_accroche: string;
    explication: string;
    conditions_eligibilite: string;
    equipements_eligibles: string;
    travaux_eligibles: string;
    montant: string;
    en_savoir_plus: string;
    description_courte: string;
    description: string;
    source: string;
    sources: [
      {
        id: number;
        libelle: string;
        lien: string;
      },
    ];
    tags_excluants: [
      {
        id: number;
        valeur: string;
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
    code_commune: string;
    code_epci: string;
    mois: string;
    include_codes_commune: string;
    exclude_codes_commune: string;
    codes_departement: string;
    code_departement: string;
    codes_region: string;
    code_region: string;
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
    est_gratuit: boolean;
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
    quizzes: {
      data: [
        {
          id: number;
        },
      ];
    };
    kycs: {
      data: [
        {
          id: number;
          attributes: {
            code: string;
          };
        },
      ];
    };
    besoins: {
      data: [
        {
          attributes: {
            code: string;
          };
        },
      ];
    };
    tag_v2_incluants: {
      data: [
        {
          attributes: {
            code: string;
          };
        },
      ];
    };
    tag_v2_excluants: {
      data: [
        {
          attributes: {
            code: string;
          };
        },
      ];
    };
    selections: {
      data: [
        {
          attributes: {
            code: string;
          };
        },
      ];
    };
    faqs: {
      data: [
        {
          id: number;
          attributes: {
            question: string;
            reponse: string;
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
    sous_thematique: {
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

    partenaires: {
      data: [
        {
          id: number;
        },
      ];
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
