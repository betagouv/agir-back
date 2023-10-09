const aides = {
  aide_velo: {
    titre: 'Simulez une aide pour acheter un vélo',
    soustitre: '',
    thematique_gamification: 'transport',
    tags: [],
    duree: '⏱️ 2 minute',
    frequence: 'Une fois',
    image_url:
      'https://images.unsplash.com/photo-1570679334008-c97544c8695b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGJpa2V8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&w=800&q=60',
    url: null,
    difficulty: 1,
    points: 25,
    locked: false,
  },
  ajouter_linky: {
    titre: 'Connectez votre compteur Linky',
    soustitre: '-',
    thematique_gamification: 'logement',
    tags: [],
    duree: '⏱️ 2 minutes',
    frequence: null,
    image_url:
      'https://images.unsplash.com/photo-1454779132693-e5cd0a216ed3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVsZWN0cmljaXR5fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    url: null,
    difficulty: 3,
    points: 25,
    locked: true,
  },
  aide_retrofit: {
    titre: "Passer à l'électrique",
    soustitre: 'bla bla',
    thematique_gamification: 'transport',
    tags: ['aide', 'mobilité', 'voiture', 'électrique'],
    duree: '⏱️ < 2 minute',
    frequence: 'Une fois',
    image_url: 'https://picsum.photos/200/300',
    url: null,
    difficulty: 1,
    points: 50,
    locked: false,
  },
};
module.exports = aides;
