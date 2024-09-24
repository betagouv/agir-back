import { DifficultyLevel } from '../contenu/difficultyLevel';
import { ContentType } from '../contenu/contentType';
import { Thematique } from '../contenu/thematique';
import { Todo } from './todo';
import { v4 as uuidv4 } from 'uuid';
import { Todo_v0 } from '../object_store/parcoursTodo/parcoursTodo_v0';
import { CelebrationType } from '../gamification/celebrations/celebration';
import { Feature } from '../gamification/feature';
import { App } from '../app';

export class TodoCatalogue {
  public static getNombreTodo(): number {
    return TodoCatalogue.getRAWCatalogue().length;
  }

  public static getAllTodos(): Todo[] {
    const result: Todo[] = [];
    TodoCatalogue.getRAWCatalogue().forEach((current_todo) => {
      result.push(new Todo(current_todo));
    });
    return result;
  }

  public static getTodoOfNumero(numero: number) {
    return new Todo(TodoCatalogue.getRAWCatalogue()[numero - 1]);
  }

  private static getRAWCatalogue() {
    if (App.isProd()) {
      return TodoCatalogue.catalogue;
    } else {
      return TodoCatalogue.DEV_catalogue;
    }
  }

  public static getEmptyLastMission(): Todo {
    const result = new Todo({
      numero_todo: null,
      points_todo: 0,
      titre: 'Plus de mission, pour le moment...',
      imageUrl: 'https://',
      done_at: null,
      done: [],
      todo: [],
      celebration: null,
    });
    result.is_last = true;
    return result;
  }

  private static NEW_DEV_catalogue: Todo_v0[] = [
    {
      numero_todo: 1,
      points_todo: 0,
      titre: 'Découvrir Mes aides',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1727099530/1_9911eb628c.svg',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'Vos aides',
          description: `En fonction de votre situation et de votre lieu de vie !`,
          feature: Feature.aides,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre:
            'Avez-vous un projet nécessitant un soutien matériel ou financier ?',
          content_id: 'KYC_soutien_projet',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Connaissez-vous des aides nationales ?',
          content_id: 'KYC_connaissance_aides_nationales',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 0,
      titre: 'Découvrir La Bibliothèque',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1727099530/2_1a66ec4a41.svg',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'La bibliothèque',
          description: `Pour retrouver tous vos articles lus !`,
          feature: Feature.bibliotheque,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Lire votre premier article : Bienvenue sur Agir !',
          content_id: '170',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Découvrir des articles et quiz recommandés pour vous',
          content_id: null,
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.recommandations,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
    {
      numero_todo: 3,
      points_todo: 0,
      titre: 'Découvrir Mon empreinte environnementale',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1727099530/3_f3181e2c5e.svg',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'Votre empreinte carbone',
          description: `Evaluez et mettez à jour votre empreinte carbone`,
          feature: Feature.bilan_carbone,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Qu’est-ce qu’un bilan carbone ?',
          content_id: '2',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Avez-vous réalisé votre bilan carbone ?',
          content_id: 'KYC_bilan',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: `5 questions pour avoir une première estimation de son empreinte`,
          content_id: 'ENCHAINEMENT_KYC_mini_bilan_carbone',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.enchainement_kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
  ];

  private static catalogue: Todo_v0[] = [
    {
      numero_todo: 1,
      points_todo: 50,
      titre: 'Mission 1 - Faisons connaissance',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1718959272/Mission_1_2076902965.png',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'Vos recommandations',
          description: `Toujours plus de contenu, et en fonction de vos centres d'intérêt`,
          feature: Feature.recommandations,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Bienvenue sur AGIR !',
          content_id: '170',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Comment avez-vous connu le service ?',
          content_id: '_1',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Quelle est votre situation professionnelle ?',
          content_id: 'KYC005',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: `Qu'est-ce que le réchauffement climatique ?`,
          content_id: '13',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: `Qu'est-ce que le réchauffement climatique ?`,
          content_id: '13',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: `Qu'est-ce que le réchauffement climatique ?`,
          content_id: '13',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 50,
      titre: 'Mission 2 - Motivations et freins',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1718959271/Mission_3_e87ba4bebb.png',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'Vos aides',
          description: `En fonction de votre situation et de votre lieu de vie !`,
          feature: Feature.aides,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Quelles thématiques vous intéressent ?',
          content_id: 'KYC001',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Quelles sont vos motivations ?',
          content_id: 'KYC_motivation',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Quels sont vos freins ?',
          content_id: 'KYC_contrainte',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
    {
      numero_todo: 3,
      points_todo: 50,
      titre: 'Mission 3 - Connaître son impact',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1718959271/Mission_2_bb3aa4b43d.png',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'Vos univers à explorer',
          description: `Retrouvez des programmes d'accompagnement sur les thématiques de la transition écologique`,
          feature: Feature.univers,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Quelles sont vos pratiques ?',
          content_id: 'KYC_habitude',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Avez-vous réalisé votre bilan carbone ?',
          content_id: 'KYC_bilan',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: `L’empreinte des Français`,
          content_id: '2',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
  ];

  private static DEV_catalogue: Todo_v0[] = TodoCatalogue.NEW_DEV_catalogue;
  /*[
    {
      numero_todo: 1,
      points_todo: 50,
      titre: 'Découvrir Mes aides',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1718959272/Mission_1_2076902965.png',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'Vos aides',
          description: `En fonction de votre situation et de votre lieu de vie !`,
          feature: Feature.aides,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Lire votre premier article : Bienvenue sur Agir !',
          content_id: '170',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 50,
      titre: 'Découvrir La Bibliothèque',
      imageUrl:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1718959271/Mission_3_e87ba4bebb.png',
      done_at: null,
      celebration: {
        id: uuidv4(),
        titre: 'Nouvelle Fonctionnalité',
        type: CelebrationType.reveal,
        reveal: {
          id: uuidv4(),
          titre: 'La bibliothèque',
          description: `Pour retrouver tous vos articles lus !`,
          feature: Feature.bibliotheque,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Découvrir des articles et quiz recommandés pour vous',
          content_id: null,
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.recommandations,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Quelles sont vos motivations ?',
          content_id: 'KYC_motivation',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: `5 questions pour avoir une première estimation de son empreinte`,
          content_id: 'ENCHAINEMENT_KYC_1',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.enchainement_kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
      ],
    },
  ];
  */
}
