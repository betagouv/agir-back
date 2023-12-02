import {
  Impact,
  Thematique as ThemaOnbo,
} from '../src/domain/utilisateur/onboarding/onboarding';

const minQuizzLevel = {
  alimentation: { level: 1, isCompleted: false },
  transport: { level: 1, isCompleted: false },
  logement: { level: 1, isCompleted: false },
  consommation: { level: 1, isCompleted: false },
  climat: { level: 1, isCompleted: false },
  dechet: { level: 1, isCompleted: false },
  loisir: { level: 1, isCompleted: false },
};

const ALL_INTERACTIONS = [
  { cms_id: 1, cms_type: 'quizz', score: 0.5 },
  { cms_id: 2, cms_type: 'quizz', score: 0.5 },
  { cms_id: 4, cms_type: 'quizz', score: 0.5 },
  { cms_id: 5, cms_type: 'quizz', score: 0.5 },
  { cms_id: 5, cms_type: 'quizz', score: 0.5 },
  { cms_id: 7, cms_type: 'quizz', score: 0.5 },
  { cms_id: 8, cms_type: 'quizz', score: 0.5 },
  { cms_id: 9, cms_type: 'quizz', score: 0.5 },
  { cms_id: 10, cms_type: 'quizz', score: 0.5 },
  { cms_id: 11, cms_type: 'quizz', score: 0.5 },
  { cms_id: 12, cms_type: 'quizz', score: 0.5 },
  { cms_id: 13, cms_type: 'quizz', score: 0.5 },
  { cms_id: 2, cms_type: 'article', score: 0.5 },
  { cms_id: 3, cms_type: 'article', score: 0.5 },
  { cms_id: 4, cms_type: 'article', score: 0.5 },
  { cms_id: 5, cms_type: 'article', score: 0.5 },
  { cms_id: 6, cms_type: 'article', score: 0.5 },
  { cms_id: 11, cms_type: 'article', score: 0.5 },
  { cms_id: 12, cms_type: 'article', score: 0.5 },
  { cms_id: 13, cms_type: 'article', score: 0.5 },
  { cms_id: 14, cms_type: 'article', score: 0.5 },
];

const ONBOARD_DATA_1234 = {
  transports: ['voiture', 'pied'],
  avion: 2,
  code_postal: '91120',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'superficie_70',
  chauffage: 'gaz',
  repas: 'vegan',
  consommation: 'secondemain',
};

const ONBOARDING_RES_1234 = {
  ventilation_par_thematiques: {
    alimentation: Impact.tres_faible,
    transports: Impact.tres_eleve,
    logement: Impact.eleve,
    consommation: Impact.faible,
  },
  ventilation_par_impacts: {
    '1': [ThemaOnbo.alimentation],
    '2': [ThemaOnbo.consommation],
    '3': [ThemaOnbo.logement],
    '4': [ThemaOnbo.transports],
  },
};

const utilisateurs = {
  michel0: {
    nom: 'Michel0',
    prenom: 'Mimi0',
    email: 'michel0@beta.com',
    mot_de_passe: 'incroyable',
    code_postal: '49100',
    commune: 'ANGERS',
    revenu_fiscal: 20000,
    parts: 2.5,
    numero_todo: 1,
    gamification: {
      points: 0,
    },
    interactions: ALL_INTERACTIONS,
    suivis: [],
    quizzLevels: minQuizzLevel,
    onboardingResult: ONBOARDING_RES_1234,
    onboardingData: ONBOARD_DATA_1234,
  },
  michel6: {
    nom: 'Michel6',
    prenom: 'Mimi6',
    email: 'michel6@beta.com',
    mot_de_passe: 'incroyable',
    code_postal: '49100',
    commune: 'ANGERS',
    revenu_fiscal: 20000,
    parts: 2.5,
    numero_todo: 1,
    gamification: {
      points: 0,
    },
    interactions: ALL_INTERACTIONS,
    suivis: [
      'sa1',
      'sa2',
      'sa3',
      'sa4',
      'sa5',
      'st1',
      'st2',
      'st3',
      'st4',
      'st5',
    ],
    bilans: ['bilan1'],
    badges: [],
    quizzLevels: minQuizzLevel,
    onboardingResult: ONBOARDING_RES_1234,
    onboardingData: ONBOARD_DATA_1234,
  },
  wojtek: {
    nom: 'WOJCIK',
    prenom: 'Wojtek',
    email: 'ww@w.com',
    mot_de_passe: 'haha',
    code_postal: '91120',
    commune: 'PALAISEAU',
    revenu_fiscal: 666,
    parts: 7.5,
    numero_todo: 1,
    gamification: {
      points: 0,
    },
    //interactions: ALL_INTERACTIONS,
    suivis: ['sa1', 'sa2', 'sa3', 'st1', 'st2', 'st3'],
    bilans: ['bilan1'],
    badges: ['badge1', 'badge2'],
    services: [],
    questionsNGC: {
      'transport . voiture . km': 30000,
    },
    quizzLevels: minQuizzLevel,
    onboardingResult: ONBOARDING_RES_1234,
    onboardingData: ONBOARD_DATA_1234,
  },
};

module.exports = utilisateurs;
