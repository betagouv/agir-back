import {
  CategorieQuestionKYC,
  QuestionKYCData,
  TypeReponseQuestionKYC,
} from './questionQYC';

const CATALOGUE_QUESTIONS: QuestionKYCData[] = [
  {
    id: '1',
    question: 'Comment avez vous connu le service ?',
    type: TypeReponseQuestionKYC.libre,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
  },
  {
    id: '2',
    question: `Quel est votre sujet principal d'intéret ?`,
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
    reponses_possibles: ['Le climat', 'Mon logement', 'Ce que je mange'],
  },
  {
    id: '3',
    question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
    reponses_possibles: ['Oui', 'Non', 'A voir'],
  },
  {
    id: '4',
    question: `Quel est ton age`,
    type: TypeReponseQuestionKYC.entier,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
  },
  {
    id: '5',
    question: `Combient coute un malabar`,
    type: TypeReponseQuestionKYC.decimal,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 10,
  },
];

module.exports = CATALOGUE_QUESTIONS;
