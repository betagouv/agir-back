import { QuestionKYC_v0 } from '../object_store/kyc/kyc_v0';
import { CategorieQuestionKYC, TypeReponseQuestionKYC } from './questionQYC';

const CATALOGUE_QUESTIONS: QuestionKYC_v0[] = [
  {
    id: '1',
    question:
      'Sur quel(s) sujet(s) voudriez-vous être accompagné pour réduire votre impact environnemental ?',
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
];

module.exports = CATALOGUE_QUESTIONS;
