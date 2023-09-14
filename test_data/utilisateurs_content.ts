const minQuizzLevel = {
  alimentation: { level: 1, isCompleted: false },
  transport: { level: 1, isCompleted: false },
  logement: { level: 1, isCompleted: false },
  consommation: { level: 1, isCompleted: false },
  climat: { level: 1, isCompleted: false },
  dechet: { level: 1, isCompleted: false },
  loisir: { level: 1, isCompleted: false },
};

const utilisateurs = {
  michel0: {
    name: 'Michel0',
    points: 0,
    interactions: [
      { id: 'suivi_du_jour', score: 0.5 },
      { id: 'quizz_alimentation_emissions_GES', score: 0.4 },
      { id: 'article_faire_nos_gestes_climat', score: 0.3 },
      { id: 'article_transport_se_deplacer_autrement', score: 0.2 },
      {
        id: 'ajouter_linky',
        score: 0.1,
        locked: true,
        pinned_at_position: 3,
      },
      { id: 'quizz_objectif_GES', score: 0.01 },
      {
        id: 'quizz-BC_global_rechauffement_climatique',
        score: 0.001,
        locked: true,
      },
    ],
    suivis: [], //'sa1', 'sa2', 'st1',
    quizzLevels: minQuizzLevel,
  },
  michel6: {
    name: 'Michel6',
    points: 36,
    interactions: [
      { id: 'suivi_du_jour', score: 0.9 },
      { id: 'quizz-BC_global_gaz_effet_de_serre', score: 0.8 },
      { id: 'article_consommation_indice_de_reparabilite', score: 0.7 },
      { id: 'aide_velo', score: 0.6, locked: true, pinned_at_position: 3 },
      { id: 'article_alimentation_recettes_4_saisons', score: 0.5 },
      { id: 'article_consommation_video_numerique_responsable', score: 0.4 },
      {
        id: 'article-cms',
        score: 0.99,
      },
      {
        id: 'article-cms-2',
        score: 0.98,
      },
      {
        id: 'article-cms-3',
        score: 0.97,
      },
      {
        id: 'article-cms-4',
        score: 0.96,
      },
      {
        id: 'article-cms-5',
        score: 0.95,
      },
    ],
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
    badges: ['badge1', 'badge2'],
    quizzLevels: minQuizzLevel,
  },
  benoit: {
    name: 'Benoit',
    points: 0,
    interactions: [
      { id: 'suivi_du_jour', score: 0.9 },
      { id: 'article_transport_se_deplacer_autrement', score: 0.8 },
      { id: 'quizz-BC_global_gaz_effet_de_serre', score: 0.7 },
      { id: 'quizz_objectif_GES', score: 0.6 },
    ],
    suivis: [], //'sa1', 'sa2', 'st1'
    quizzLevels: minQuizzLevel,
  },
  dorian: {
    name: 'Dorian_test',
    points: 0,
    interactions: [
      { id: 'article_eau', score: 0.5 },
      { id: 'article_viande', score: 0.1 },
      { id: 'suivi_du_jour', score: 0.9 },
      { id: 'quizz_textile1', score: 0.8 },
      { id: 'quizz_dechets_electroniques', score: 0.7 },
      { id: 'quizz_bois_meubles', score: 0.7 },
    ],
    suivis: [], //'sa1', 'sa2', 'st1'
    quizzLevels: minQuizzLevel,
  },
  livio: {
    name: 'Livio_test',
    points: 36,
    interactions: [
      { id: 'aide_velo', score: 0.6 },
      { id: 'aide_retrofit', score: 0.1 },
      { id: 'suivi_du_jour', score: 0.9 },
      { id: 'quizz_tout_sur_leau', score: 0.8 },
      { id: 'quizz_poisson', score: 0.2 },
    ],
    suivis: ['sa1', 'st1', 'st2'],
    quizzLevels: minQuizzLevel,
  },
  wojtek: {
    name: 'Wojtek',
    points: 10,
    interactions: [
      //{ id: 'article-ngc', score: 0.1 },
      { id: 'quizz_tout_sur_leau', score: 0.7 },
      //{ id: 'article_eau', score: 0.4 },
      { id: 'suivi_du_jour', score: 0.9, locked: true },
      {
        id: 'article-cms',
        score: 0.99,
      },
      {
        id: 'article-cms-2',
        score: 0.98,
      },
      {
        id: 'article-cms-3',
        score: 0.97,
      },
      {
        id: 'article-cms-4',
        score: 0.96,
      },
      {
        id: 'article-cms-5',
        score: 0.95,
      },
    ],
    suivis: ['sa1', 'sa2', 'st1', 'st2'],
    bilans: ['bilan1'],
    badges: ['badge1', 'badge2'],
    questionsNGC: {
      'transport . voiture . km': 30000,
    },
    quizzLevels: minQuizzLevel,
  },
  quizzman: {
    name: 'quizzman',
    points: 10,
    interactions: [
      { id: 'quizz_objectif_GES', score: 0.1, done: true, quizz_score: 100 },
      { id: 'quizz_objectif_GES', score: 0.1, done: true, quizz_score: 100 },
      { id: 'quizz-13_rechauffement_climatique', score: 0.9 },
      { id: 'quizz-BC_global_gaz_effet_de_serre', score: 0.8 },
      { id: 'quizz_energie_fossile', score: 0.8 },
    ],
    bilans: ['bilan1'],
    badges: ['badge1'],
    quizzLevels: minQuizzLevel,
  },
};

module.exports = utilisateurs;
