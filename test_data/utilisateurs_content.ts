const utilisateurs = {
  michel0:{
    name: 'Michel0',
    points: 0,
    interactions: [
      { id: 'suivi_du_jour', reco_score: 1 },
      { id: 'quizz-BC_transport_personnes_en_voiture', reco_score: 2},
      { id: 'article_transport_se_deplacer_autrement', reco_score: 3},    
      { id: 'ajouter_linky', reco_score: 4, locked: true },
      { id: 'quizz-BC_alimentation_gaspillage_alimentaire', reco_score: 5},
      { id: 'quizz-BC_global_rechauffement_climatique', reco_score: 6, locked: true},
    ],
    suivis: [], //'sa1', 'sa2', 'st1'
  },
  michel6:{
    name: 'Michel6',
    points: 36,
    interactions: [
      { id: 'suivi_du_jour', reco_score: 1 },
      { id: 'quizz-BC_global_gaz_effet_de_serre', reco_score: 2},
      { id: 'article_consommation_indice_de_reparabilite', reco_score: 3 },     
      { id: 'aide_velo', reco_score: 4, locked: true},      
      { id: 'article_alimentation_recettes_4_saisons', reco_score: 5 },      
      { id: 'article_consommation_video_numerique_responsable', reco_score: 6 },     
    ],
    suivis: ['sa1', 'sa2', 'sa3','sa4','sa5', 'st1','st2','st3','st4','st5'],
    bilans: ['bilan1'],
    badges: ['badge1', 'badge2'],
  },
  benoit: {
    name: 'Benoit',
    points: 0,
    interactions: [
      { id: 'suivi_du_jour', reco_score: 1 },
      { id: 'article_transport_se_deplacer_autrement', reco_score: 2 }      
    ],
    suivis: [], //'sa1', 'sa2', 'st1'
  },
  dorian: {
    name: 'Dorian_test',
    points: 0,
    interactions: [
      { id: 'article_eau', reco_score: 5 },
      { id: 'article_viande', reco_score: 10 },
      { id: 'suivi_du_jour', reco_score: 1 },
      { id: 'quizz_mobilite_douce', reco_score: 1},
      { id: 'quizz_tout_sur_leau', reco_score: 2 }
      
    ],
    suivis: [], //'sa1', 'sa2', 'st1'
  },
  livio: {
    name: 'Livio_test',
    points: 36,
    interactions: [
      { id: 'aide_velo', reco_score: 4 },
      { id: 'aide_retrofit', reco_score: 15 },
      { id: 'suivi_du_jour', reco_score: 1 },
      { id: 'quizz_tout_sur_leau', reco_score: 3 },
      { id: 'quizz_poisson', reco_score: 10 },
    ],
    suivis: ['sa1', 'st1', 'st2'],
  },
  wojtek: {
    name: 'Wojtek',
    points: 10,
    interactions: [
      { id: 'quizz_tout_sur_leau', reco_score: 3 },
      { id: 'article_eau', reco_score: 5 },
      { id: 'suivi_du_jour', reco_score: 1, locked: true },
    ],
    suivis: ['sa1', 'sa2', 'st1', 'st2'],
    bilans: ['bilan1'],
    badges: ['badge1', 'badge2'],
  },
};
module.exports = utilisateurs;
