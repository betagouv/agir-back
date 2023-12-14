import { v4 as uuidv4 } from 'uuid';
import { Feature } from '../feature';

export class Reveal {
  private static readonly DATA_REVEAL: Record<
    Feature,
    { titre: string; description: string; url: string }
  > = {
    aides: {
      titre: "Découvrez le catalogue d'aides nationnales et locales !",
      description: `Mais oui c'est trop génial`,
      url: '/vos-aides',
    },
    services: {
      titre:
        "Un service permet d'avoir toujours sous les yeux vos fonctionnalités clés",
      description: `C'est magique`,
      url: '/coach/services',
    },
    recommendations: {
      titre:
        "Encore des articles et des quiz rien que pour vous ! Esn fonction de vos centres d'intérêt",
      description: `Une cascade de connaissance`,
      url: '/coach',
    },
  };
  constructor(feature: Feature) {
    const data = Reveal.DATA_REVEAL[feature];
    this.id = uuidv4();
    this.feature = feature;
    this.titre = data.titre;
    (this.description = data.description), (this.url = data.url);
  }
  id: string;
  feature: Feature;
  titre: string;
  description: string;
  url: string;
}
