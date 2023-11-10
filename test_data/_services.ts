const services = {
  recettes: {
    titre: 'La recette du jour, de saison !',
    url: 'https://cuisine-facile.com/index.php',
    icon_url: 'https://picsum.photos/50',
    image_url: 'https://picsum.photos/200/300',
    is_url_externe: true,
    is_local: true,
    thematiques: ['alimentation'],
  },
  linky: {
    titre: 'Votre conso élec au jour le jour',
    url: 'https://www.enedis.fr/le-compteur-linky-un-outil-pour-la-transition-ecologique',
    icon_url: 'https://picsum.photos/50',
    image_url: 'https://picsum.photos/200/300',
    is_url_externe: true,
    is_local: false,
    thematiques: ['climat', 'logement'],
  },
  suivi_transport: {
    titre: `Suivez l'impact de vos trajets quotidiens`,
    url: 'coach/suivi-du-jour',
    icon_url: 'https://picsum.photos/50',
    image_url: 'https://picsum.photos/200/300',
    is_url_externe: false,
    is_local: false,
    thematiques: ['transport'],
  },
  ecowatt: {
    titre: `Etat du réseau en France`,
    url: 'https://www.monecowatt.fr/',
    icon_url: 'https://www.monecowatt.fr/themes/ecowatt/images/logoecowatt.png',
    image_url:
      'https://agirpourlatransition.ademe.fr/particuliers/sites/default/files/styles/550x330/public/2022-03/thermostat-programmable.jpg?itok=4HIKhFAI',
    is_url_externe: true,
    is_local: false,
    thematiques: ['logement'],
    minute_period: 20,
  },
};
module.exports = services;
