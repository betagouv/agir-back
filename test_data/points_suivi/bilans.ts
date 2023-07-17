const bilans = {
  bilan1: {
    date: '2023-02-17',
    initial: true,
    situation: {
      'transport . voiture . km': { valeur: 12000, unité: 'km / an' },
      'transport . voiture . propriétaire': 'non',
      'transport . voiture . gabarit': "'VUL'",
      'transport . voiture . motorisation': "'électrique'",
      'transport . voiture . saisie voyageurs': {
        valeur: 2,
        unité: 'voyageurs',
      },
      'transport . deux roues . usager': 'non',
      'transport . avion . usager': 'non',
    },
    bilan: {
      details: {
        divers: 852.8584599753638,
        logement: 1424.3853917865213,
        transport: 905.7128413055185,
        alimentation: 2033.7441687666667,
        services_societaux: 1553.6358095597056,
      },
      bilan_carbone_annuel: 6770.336671393776,
    },
  },
};
module.exports = bilans;
