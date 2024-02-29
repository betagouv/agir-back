import { QuestionKYC_v0 } from '../object_store/kyc/kyc_v0';
import { CategorieQuestionKYC, TypeReponseQuestionKYC } from './questionQYC';

const CATALOGUE_QUESTIONS: QuestionKYC_v0[] = [
  {
    id: '001',
    question:
      'Sur quel(s) sujet(s) souhaitez-vous en savoir plus pour réduire votre impact environnemental ?',
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.service,
    points: 5,
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
