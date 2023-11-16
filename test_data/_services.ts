const services = {
  recettes: {
    titre: 'La recette du jour, de saison !',
    url: 'https://cuisine-facile.com/index.php',
    icon_url: 'https://cdn-icons-png.flaticon.com/512/823/823214.png',
    image_url:
      'https://img.mesrecettesfaciles.fr/wp-content/uploads/2017/02/Quichericottaepinards-1000x500.webp',
    is_url_externe: true,
    is_local: true,
    thematiques: ['alimentation'],
    description: 'Recette éco !!',
    sous_description: `Des recettes riches en plaisir et faibles en CO2, rien d'impossible !! Des milliers de recettes par thèmes et ingrédients, et toujours avec fruits et légumes de saison !`,
  },
  linky: {
    titre: 'Votre conso élec au jour le jour',
    url: 'https://www.enedis.fr/le-compteur-linky-un-outil-pour-la-transition-ecologique',
    icon_url: 'https://www.gwa.fr/actualites/media/compteur-linky.jpg',
    image_url:
      'https://www.maison-travaux.fr/wp-content/uploads/sites/8/2022/10/multiprise-electricite-incendie-dangers.png',
    is_url_externe: true,
    is_local: false,
    thematiques: ['climat', 'logement'],
    description: 'Votre suivi consommation, sans rien faire',
    sous_description: `Surveillez en un click l'évolution quotidienne de votre consommation électrique, comprenez vos habitudes, chassez toutes les pertes inutiles !!`,
  },
  suivi_transport: {
    titre: `Suivez l'impact de vos trajets quotidiens`,
    url: 'coach/suivi-du-jour',
    icon_url: 'https://cdn-icons-png.flaticon.com/512/664/664535.png', // https://cdn-icons-png.flaticon.com/512/4684/4684011.png
    image_url:
      'https://www.ecologie.gouv.fr/sites/default/files/Covoiturage.JPG',
    is_url_externe: false,
    is_local: false,
    thematiques: ['transport'],
    description: `Suivez dans le temps l'impact de vos déplacement`,
    sous_description:
      'Voiture, avions, train... tout comprendre de vos habitudes et de leur impacts : les suivre dans le temps, se fixer des objectifs concrets et voir vos progrès',
  },
  ecowatt: {
    titre: `Etat du réseau en France`,
    url: 'https://www.monecowatt.fr/',
    icon_url:
      'https://play-lh.googleusercontent.com/wtQahY_I8TVLQJ_Rcue7aC-dJ3FfZLNQe84smsyfRa9Qbs1-TG3CJvdrmQ9VUXUVO8vh=w480-h960',
    image_url:
      'https://agirpourlatransition.ademe.fr/particuliers/sites/default/files/styles/550x330/public/2022-03/thermostat-programmable.jpg?itok=4HIKhFAI',
    is_url_externe: true,
    is_local: false,
    thematiques: ['logement'],
    minute_period: 30,
    description: 'Ecowatt aide les Français à mieux consommer l’électricité.',
    sous_description:
      'Véritable météo de l’électricité, Ecowatt qualifie en temps réel le niveau de consommation des Français.',
  },
  fruits: {
    titre: `Fruits et légumes de saison`,
    url: 'https://impactco2.fr/fruitsetlegumes',
    icon_url:
      'https://static.vecteezy.com/ti/vecteur-libre/p1/3179773-fruits-et-legumes-icon-set-vector-design-gratuit-vectoriel.jpg',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Broccoli_bunches.jpg/320px-Broccoli_bunches.jpg',
    is_url_externe: true,
    is_local: true,
    thematiques: ['alimentation'],
    description: 'Découvrez les fruits et légumes du mois',
    sous_description: `Manger local et de saison est un changement d'habitude à impact fort sur votre bilan carbone, alors GO GO GO  !!!`,
  },
};
module.exports = services;
