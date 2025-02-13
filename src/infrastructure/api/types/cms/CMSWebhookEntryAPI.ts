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
export class CMSWebhookSourceAPI {
  @ApiProperty() id: number;
  @ApiProperty() libelle: string;
  @ApiProperty() lien: string;
}
export class CMSWebhookFamilleAPI {
  @ApiProperty() id: number;
  @ApiProperty() nom: string;
  @ApiProperty() ordre: number;
}
export class CMSWebhookReponseAPI {
  @ApiProperty() id: number;
  @ApiProperty() reponse: string;
  @ApiProperty() exact: boolean;
}
export class CMSWebhookQuestionAPI {
  @ApiProperty() id: number;
  @ApiProperty() libelle: string;
  @ApiProperty() explicationOk: string;
  @ApiProperty() explicationKO: string;
  @ApiProperty({ type: [CMSWebhookReponseAPI] })
  reponses: CMSWebhookReponseAPI[];
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
}
export class CMSWebhookArticleAPI {
  @ApiProperty() id: number;
}
export class CMSWebhookEntryAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() Titre: string;
  @ApiProperty() introduction: string;
  @ApiProperty() code: string;
  @ApiProperty() categorie_recettes: string;
  @ApiProperty() est_visible: boolean;
  @ApiProperty() est_gratuit: boolean;
  @ApiProperty() is_examen: boolean;
  @ApiProperty() is_first: boolean;
  @ApiProperty() include_codes_commune: string;
  @ApiProperty() exclude_codes_commune: string;
  @ApiProperty() codes_departement: string;
  @ApiProperty() codes_region: string;
  @ApiProperty() categorie: string;
  @ApiProperty() type: string;
  @ApiProperty() type_action: string;
  @ApiProperty() label: string;
  @ApiProperty() question: string;
  @ApiProperty({ type: [CMSWebhookArticleAPI] })
  articles: CMSWebhookArticleAPI[];
  @ApiProperty({ type: [CMSWebhookQuestionAPI] })
  questions: CMSWebhookQuestionAPI[];
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
  @ApiProperty() contenu: string;
  @ApiProperty() description: string;
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique_gamification: CMSThematiqueAPI;

  @ApiProperty({ type: CMSTagArticleAPI })
  tag_article: CMSTagArticleAPI;

  @ApiProperty({ type: [CMSThematiqueAPI] })
  thematiques: CMSThematiqueAPI[];

  @ApiProperty({ type: [CMSWebhookBesoinAPI] })
  besoins: CMSWebhookBesoinAPI[];

  @ApiProperty({ type: [IDAPI] })
  quizzes: IDAPI[];

  @ApiProperty({ type: [IDAPI] })
  kycs: IDAPI[];

  @ApiProperty({ type: [CMSWebhookUniversAPI] })
  univers: CMSWebhookUniversAPI[];
  @ApiProperty({ type: [CMSWebhookThematiqueUniversAPI] })
  thematique_univers: CMSWebhookThematiqueUniversAPI[];
  @ApiProperty({ type: CMSWebhookThematiqueUniversAPI })
  thematique_univers_unique: CMSWebhookThematiqueUniversAPI;

  @ApiProperty({ type: [CMSWebhookObjectifAPI] })
  objectifs: CMSWebhookObjectifAPI[];

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
  @ApiProperty() comment: string;
  @ApiProperty() objet_lvo: string;
  @ApiProperty() action_lvo: string;
  @ApiProperty() source: string;
  @ApiProperty({ type: [CMSWebhookSourceAPI] }) sources: CMSWebhookSourceAPI[];
  @ApiProperty() echelle: string;
  @ApiProperty() url_source: string;
  @ApiProperty() url_demande: string;
  @ApiProperty() date_expiration: Date;
  @ApiProperty() derniere_maj: Date;
  @ApiProperty() frequence: string;
  @ApiProperty({ type: CMSWebhookImageURLAPI }) imageUrl: CMSWebhookImageURLAPI;
  @ApiProperty({ type: CMSWebhookImageURLAPI }) logo: CMSWebhookImageURLAPI[];
  @ApiProperty() difficulty: number;
  @ApiProperty() points?: number;
  @ApiProperty() unite?: string;
  @ApiProperty() emoji?: string;
  @ApiProperty() impact_kg_co2: number;
  @ApiProperty() codes_postaux?: string;
  @ApiProperty() mois?: string;
  @ApiProperty() publishedAt: Date;
  @ApiProperty() url_detail_front: string;
  @ApiProperty() is_simulation: boolean;
  @ApiProperty() is_ngc: boolean;
  @ApiProperty() A_SUPPRIMER: boolean;
  @ApiProperty() ngc_key: string;
  @ApiProperty() nom: string;
  @ApiProperty() lien: string;
  @ApiProperty() montantMaximum: string;
}
