const utilisateurs = {
  dorian: {
    name: 'Dorian',
    points: 0,
    interactions: [
      { id: 'article_eau', reco_score: 5 },
      { id: 'article_viande', reco_score: 10 },
      { id: 'suivi_alimentation', reco_score: 1 },
      { id: 'tout_sur_leau', reco_score: 2 },
    ],
    suivis: ['sa1', 'sa2', 'st1'],
  },
  livio: {
    name: 'Livio',
    points: 36,
    interactions: [
      { id: 'aide_velo', reco_score: 4 },
      { id: 'aide_retrofit', reco_score: 15 },
      { id: 'suivi_alimentation', reco_score: 1 },
      { id: 'suivi_transport', reco_score: 2 },
      { id: 'tout_sur_leau', reco_score: 3 },
      { id: 'poisson', reco_score: 10 },
    ],
    suivis: ['sa1', 'st1', 'st2'],
  },
};
module.exports = utilisateurs;
