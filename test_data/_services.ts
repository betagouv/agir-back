const services = {
  recettes: {
    titre: 'Un délice végétarien chaque jour',
    url: 'https://cuisine-facile.com/index.php',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335563/services/823214.png',
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335725/services/Quichericottaepinards-1000x500.webp',
    is_url_externe: true,
    is_local: true,
    thematiques: ['alimentation'],
    description:
      'Découvrez notre service quotidien de recettes 100% légumes, une expérience culinaire délicieuse et saine.',
    sous_description: `Chaque jour, nous vous livrons une nouvelle recette végétarienne savoureuse, mettant en avant la fraîcheur des légumes de saison.`,
  },
  linky: {
    titre: 'Votre conso élec au jour le jour',
    url: 'https://www.enedis.fr/le-compteur-linky-un-outil-pour-la-transition-ecologique',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335751/services/compteur-linky.jpg',
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335771/services/multiprise-electricite-incendie-dangers.png',
    is_url_externe: true,
    is_local: false,
    thematiques: ['logement'],
    description: 'Votre suivi consommation, sans rien faire',
    sous_description: `Surveillez en un click l'évolution quotidienne de votre consommation électrique, comprenez vos habitudes, chassez toutes les pertes inutiles !!`,
    configuration: { prm: '123', winter_pk: 'abc' },
  },
  suivi_transport: {
    titre: `Suivez l'impact de vos trajets quotidiens`,
    url: 'coach/suivi-du-jour',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335811/services/664535.png', // https://cdn-icons-png.flaticon.com/512/4684/4684011.png
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335828/services/Covoiturage.jpg',
    is_url_externe: false,
    is_local: false,
    thematiques: ['transport'],
    description: `Suivez dans le temps l'impact de vos déplacements`,
    sous_description:
      'Voiture, avions, train... tout comprendre de vos habitudes et de leur impacts : les suivre dans le temps, se fixer des objectifs concrets et voir vos progrès',
  },
  ecowatt: {
    titre: `⚡️ ÉcoWatt`,
    url: 'https://www.monecowatt.fr/',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335871/services/wtQahY_I8TVLQJ_Rcue7aC-dJ3FfZLNQe84smsyfRa9Qbs1-TG3CJvdrmQ9VUXUVO8vh_w480-h960.png',
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335965/services/thermostat-programmable.jpg',
    is_url_externe: true,
    is_local: false,
    thematiques: ['logement'],
    minute_period: 30,
    description: 'Ecowatt aide les Français à mieux consommer l’électricité.',
    sous_description:
      'Véritable météo de l’électricité, Ecowatt qualifie en temps réel le niveau de consommation des Français.',
  },
  fruits: {
    titre: `🗓️ Fruits et légumes de saison`,
    url: 'https://impactco2.fr/fruitsetlegumes',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335996/services/3179773-fruits-et-legumes-icon-set-vector-design-gratuit-vectoriel.jpg',
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708336015/services/320px-Broccoli_bunches.jpg',
    is_url_externe: true,
    is_local: true,
    thematiques: ['alimentation'],
    description: 'Découvrez les fruits et légumes du mois',
    sous_description: `Manger local et de saison est un changement d'habitude à impact fort sur votre bilan carbone, alors GO GO GO  !!!`,
  },
};
module.exports = services;
