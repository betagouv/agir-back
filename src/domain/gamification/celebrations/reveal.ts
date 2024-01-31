import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../feature';

export class Reveal {
  private static readonly DATA_REVEAL: Record<
    Feature,
    { titre: string; description: string }
  > = {
    aides: {
      titre: 'Vos aides',
      description: `En fonction de votre situation et de où vous êtes !`,
    },
    services: {
      titre: 'Vos services',
      description: `Un service permet d'avoir toujours sous les yeux vos fonctionnalités clés`,
    },
    recommandations: {
      titre: 'Vos recommandations',
      description: `Toujours plus de contenu, et en fonction de vos centres d'intérêt`,
    },
    bibliotheque: {
      titre: 'Votre bibliothèque',
      description: `Retrouvez tout ce que vous avez lu et aimé comme articles`,
    },
  };
  constructor(feature: Feature) {
    const data = Reveal.DATA_REVEAL[feature];
    this.id = uuidv4();
    this.feature = feature;
    this.titre = data.titre;
    this.description = data.description;
  }
  id: string;
  feature: Feature;
  titre: string;
  description: string;
}
