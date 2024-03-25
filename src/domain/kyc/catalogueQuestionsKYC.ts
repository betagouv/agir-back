import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v0 } from '../object_store/kyc/kycHistory_v0';
import { Tag } from '../scoring/tag';
import {
  BooleanKYC,
  CategorieQuestionKYC,
  QuestionID,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from './questionQYC';

const CATALOGUE: QuestionKYC_v0[] = [
  {
    id: QuestionID.KYC001,
    question:
      'Sur quel(s) sujet(s) souhaitez-vous en savoir plus pour réduire votre impact environnemental ?',
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    reponses_possibles: [
      { label: '🥦 Alimentation', code: Thematique.alimentation },
      { label: '☀️ Climat et Environnement', code: Thematique.climat },
      { label: '🛒 Consommation durable', code: Thematique.consommation },
      { label: '🗑️ Déchets', code: Thematique.dechet },
      { label: '🏡 Logement', code: Thematique.logement },
      {
        label: '⚽ Loisirs (vacances, sport,...)',
        code: Thematique.loisir,
      },
      { label: '🚗 Transports', code: Thematique.transport },
      { label: 'Aucun / Je ne sais pas', code: 'rien' },
    ],
  },
  {
    id: QuestionID.KYC001,
    question:
      'Quel(s) moyen(s)de transport excluez-vous pour vos trajets du quotidien (travail, course…) ?',
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    reponses_possibles: [
      { label: 'Marcher', code: 'marcher' },
      { label: 'Faire du vélo', code: 'faire_velo' },
      { label: 'Co-voiturer', code: 'co_voit' },
      { label: 'Prendre les transports en commun', code: 'TEC' },
      { label: 'Aucun', code: 'aucun' },
    ],
  },
  {
    id: QuestionID._1,
    question: 'Comment avez vous connu le service ?',
    type: TypeReponseQuestionKYC.libre,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
    tags: [],
  },
  {
    id: QuestionID._2,
    question: `Quel est votre sujet principal d'intéret ?`,
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
    reponses_possibles: [
      { label: 'Le climat', code: Thematique.climat },
      { label: 'Mon logement', code: Thematique.logement },
      { label: 'Ce que je mange', code: Thematique.alimentation },
    ],
    tags: [],
  },
  {
    id: QuestionID._3,
    question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
    reponses_possibles: [
      { label: 'Oui', code: BooleanKYC.oui },
      { label: 'Non', code: BooleanKYC.non },
      { label: 'A voir', code: BooleanKYC.peut_etre },
    ],
    tags: [Tag.logement, Tag.climat],
  },
  {
    id: QuestionID._4,
    question: `Quel est ton age`,
    type: TypeReponseQuestionKYC.entier,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
    tags: [],
  },
  {
    id: QuestionID._5,
    question: `Combient coute un malabar`,
    type: TypeReponseQuestionKYC.decimal,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
    tags: [Tag.consommation, Tag.alimentation],
  },
];

export class CatalogueQuestionsKYC {
  private static kyc_catalogue: QuestionKYC_v0[] = CATALOGUE;

  public static getByCategorie(cat: CategorieQuestionKYC): QuestionKYC[] {
    const result = [];
    CatalogueQuestionsKYC.kyc_catalogue.forEach((e) => {
      if (e.categorie === cat) {
        result.push(new QuestionKYC(e));
      }
    });
    return result;
  }

  public static getAll(): QuestionKYC[] {
    const result = [];
    CatalogueQuestionsKYC.kyc_catalogue.forEach((e) => {
      result.push(new QuestionKYC(e));
    });
    return result;
  }

  public static getTailleCatalogue(): number {
    return CatalogueQuestionsKYC.kyc_catalogue.length;
  }

  public static getByIdOrException(id: string): QuestionKYC {
    const question = CatalogueQuestionsKYC.kyc_catalogue.find(
      (element) => element.id === id,
    );
    if (question) {
      return new QuestionKYC(question);
    }
    ApplicationError.throwQuestionInconnue(id);
  }
  public static getById(id: QuestionID): QuestionKYC {
    return new QuestionKYC(
      CatalogueQuestionsKYC.kyc_catalogue.find((element) => element.id === id),
    );
  }

  public static setCatalogue(catalogue: QuestionKYC_v0[]) {
    CatalogueQuestionsKYC.kyc_catalogue = catalogue;
  }
  public static resetCatalogue() {
    CatalogueQuestionsKYC.kyc_catalogue = CATALOGUE;
  }
}
