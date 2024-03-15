import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v0 } from '../object_store/kyc/kyc_v0';
import { Tag } from '../scoring/tag';
import {
  CategorieQuestionKYC,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from './questionQYC';

export class CatalogueQuestionsKYC {
  public static getByCategorie(cat: CategorieQuestionKYC): QuestionKYC[] {
    const result = [];
    CatalogueQuestionsKYC.questions.forEach((e) => {
      if (e.categorie === cat) {
        result.push(new QuestionKYC(e));
      }
    });
    return result;
  }

  public static getAll(): QuestionKYC[] {
    const result = [];
    CatalogueQuestionsKYC.questions.forEach((e) => {
      result.push(new QuestionKYC(e));
    });
    return result;
  }

  public static getTailleCatalogue(): number {
    return CatalogueQuestionsKYC.questions.length;
  }

  public static getByIdOrException(id: string): QuestionKYC {
    const question = CatalogueQuestionsKYC.questions.find(
      (element) => element.id === id,
    );
    if (question) {
      return new QuestionKYC(question);
    }
    ApplicationError.throwQuestionInconnue(id);
  }

  private static questions: QuestionKYC_v0[] = [
    {
      id: '001',
      question:
        'Sur quel(s) sujet(s) souhaitez-vous en savoir plus pour réduire votre impact environnemental ?',
      type: TypeReponseQuestionKYC.choix_multiple,
      is_NGC: false,
      categorie: CategorieQuestionKYC.service,
      points: 5,
      tags: [],
      reponses_possibles: [
        '🥦 Alimentation',
        '☀️ Climat et Environnement',
        '🛒 Consommation durable',
        '🗑️ Déchets',
        '🏡 Logement',
        '⚽ Loisirs (vacances, sport,...)',
        '🚗 Transports',
        'Aucun / Je ne sais pas',
      ],
    },
    {
      id: '101',
      question:
        'Faire un trajet du quotidien à pied ou à vélo plutôt qu’en voiture ou moto 1 fois cette semaine ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      categorie: CategorieQuestionKYC.defi,
      points: 5,
      tags: [Tag.interet_transports, Tag.utilise_moto_ou_voiture],
      thematique: Thematique.transport,
      reponses_possibles: [
        'Je relève le défis cette semaine',
        'Je le fais déjà',
        'Je décline le défi',
      ],
    },
    {
      id: '1',
      question: 'Comment avez vous connu le service ?',
      type: TypeReponseQuestionKYC.libre,
      is_NGC: false,
      categorie: CategorieQuestionKYC.service,
      points: 10,
      tags: [],
    },
    {
      id: '2',
      question: `Quel est votre sujet principal d'intéret ?`,
      type: TypeReponseQuestionKYC.choix_multiple,
      is_NGC: false,
      categorie: CategorieQuestionKYC.service,
      points: 10,
      reponses_possibles: ['Le climat', 'Mon logement', 'Ce que je mange'],
      tags: [],
    },
    {
      id: '3',
      question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      categorie: CategorieQuestionKYC.service,
      points: 10,
      reponses_possibles: ['Oui', 'Non', 'A voir'],
      tags: [],
    },
    {
      id: '4',
      question: `Quel est ton age`,
      type: TypeReponseQuestionKYC.entier,
      is_NGC: false,
      categorie: CategorieQuestionKYC.service,
      points: 10,
      tags: [],
    },
    {
      id: '5',
      question: `Combient coute un malabar`,
      type: TypeReponseQuestionKYC.decimal,
      is_NGC: false,
      categorie: CategorieQuestionKYC.service,
      points: 10,
      tags: [],
    },
  ];
}
