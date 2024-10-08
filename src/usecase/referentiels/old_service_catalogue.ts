const old_service_catalogue = {
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
    description: 'Des recettes variées et équilibrées.',
    sous_description: `Découvrez nos recettes 100% végétales pour varier les saveurs dans votre assiette et découvrir de nouveaux ingrédients au fil des saisons tout en conservant une alimentation équilibrée.`,
    parametrage_requis: false,
  },
  linky: {
    titre: `Votre consommation électrique au jour le jour`,
    url: 'https://www.enedis.fr/le-compteur-linky-un-outil-pour-la-transition-ecologique',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335751/services/compteur-linky.jpg',
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335771/services/multiprise-electricite-incendie-dangers.png',
    is_url_externe: true,
    is_local: false,
    thematiques: ['logement'],
    description: 'Conseils et suivi de consommation, en un seul endroit',
    sous_description: `Suivez votre consommation électrique au quotidien en un clic : analysez vos habitudes, identifiez et éliminez les gaspillages pour une efficacité énergétique optimale !`,
    parametrage_requis: true,
  },
  suivi_transport: {
    titre: `L’impact des trajets quotidiens`,
    url: 'coach/suivi-du-jour',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335811/services/664535.png', // https://cdn-icons-png.flaticon.com/512/4684/4684011.png', // https://cdn-icons-png.flaticon.com/512/4684/4684011.png
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335828/services/Covoiturage.jpg',
    is_url_externe: false,
    is_local: false,
    thematiques: ['transport'],
    description: `Suivez l'impact de vos déplacements dans le temps.`,
    sous_description:
      'Voiture, avion, train... Tout comprendre de vos habitudes et de leur impacts : suivez-les dans le temps, fixez-vous des objectifs concrets et mesurer votre évolution.',
    parametrage_requis: false,
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
      'Véritable météo de l’électricité, Ecowatt mesure le niveau de consommation des Français au jour le jour et vous propose des conseils pour réduire votre impact et optimiser votre utilisation.',
    parametrage_requis: false,
  },
  fruits: {
    titre: `🗓️ Le calendrier de saison`,
    url: 'https://impactco2.fr/fruitsetlegumes',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335996/services/3179773-fruits-et-legumes-icon-set-vector-design-gratuit-vectoriel.jpg',
    image_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708336015/services/320px-Broccoli_bunches.jpg',
    is_url_externe: true,
    is_local: true,
    thematiques: ['alimentation'],
    description: 'Découvrez les fruits et légumes du mois.',
    sous_description: `Quels fruits et légumes sont de saison ce mois-ci ? Ne doutez plus avec ce service pratique pour choisir des produits frais et locaux, tout en comparant leur empreinte carbone !`,
    parametrage_requis: false,
  },
};
module.exports = old_service_catalogue;
