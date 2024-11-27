const old_service_catalogue = {
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
};
module.exports = old_service_catalogue;
