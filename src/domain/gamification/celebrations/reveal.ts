import { v4 as uuidv4 } from 'uuid';
import { Reveal_v0 } from '../../../../src/domain/object_store/gamification/gamification_v0';
import { Feature } from '../feature';

const DATA_REVEAL: Record<Feature, { titre: string; description: string }> = {
  aides: {
    titre: 'Vos aides',
    description: `En fonction de votre situation et de votre lieu de vie !`,
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
  bilan_carbone: {
    titre: 'Votre bilan environnemental',
    description: `Evaluez et mettez à jour votre bilan environnemental`,
  },
  bilan_carbone_detail: {
    titre: 'Le détail du bilan environnemental',
    description: `Votre empreinte détaillée, sur tous les sujets de la vie quotidienne`,
  },
};

export class Reveal {
  id: string;
  feature: Feature;
  titre: string;
  description: string;

  constructor(data: Reveal_v0) {
    this.id = data.id;
    this.feature = data.feature;
    this.titre = data.titre;
    this.description = data.description;
  }

  static newRevealFromFeature(feature: Feature): Reveal {
    const reveal_data = DATA_REVEAL[feature];
    return new Reveal({
      id: uuidv4(),
      feature: feature,
      titre: reveal_data.titre,
      description: reveal_data.description,
    });
  }
}
