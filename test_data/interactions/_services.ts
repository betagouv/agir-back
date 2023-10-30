const services = {
  recettes: {
    titre: 'La recette du jour, de saison !',
    url: 'https://cuisine-facile.com/index.php',
    is_url_externe: true,
    local: true,
  },
  linky: {
    titre: 'Votre conso élec au jour le jour',
    url: 'https://www.enedis.fr/le-compteur-linky-un-outil-pour-la-transition-ecologique',
    is_url_externe: true,
    local: false,
    thematiques: ['climat', 'logement'],
  },
  suivi_transport: {
    titre: `Suivez l'impact de vos trajets quotidiens`,
    url: 'coach/suivi-du-jour',
    is_url_externe: false,
    local: false,
  },
};
module.exports = services;
