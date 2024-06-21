import { DifficultyLevel } from '../contenu/difficultyLevel';
import { ContentType } from '../contenu/contentType';
import { Thematique } from '../contenu/thematique';
import { Todo } from './todo';
import { v4 as uuidv4 } from 'uuid';
import { Todo_v0 } from '../object_store/parcoursTodo/parcoursTodo_v0';
import { CelebrationType } from '../gamification/celebrations/celebration';
import { Feature } from '../gamification/feature';
import { LiveService } from '../service/serviceDefinition';

export class TodoCatalogue {
  public static getNombreTodo(): number {
    return TodoCatalogue.catalogue.length;
  }

  public static getAllTodos(): Todo[] {
    const result: Todo[] = [];
    TodoCatalogue.catalogue.forEach((current_todo) => {
      result.push(new Todo(current_todo));
    });
    return result;
  }

  public static getTodoOfNumero(numero: number) {
    return new Todo(TodoCatalogue.catalogue[numero - 1]);
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
          titre: 'Mieux vous connaître',
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
          titre: 'Mieux vous connaître',
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
          titre: 'article 170',
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
          titre: 'quizz 13',
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
      titre: 'Mission 2 - Motivation et freins',
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
          titre: 'Mieux vous connaître',
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
          titre: 'Mieux vous connaître',
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
          titre: 'Mieux vous connaître',
          content_id: 'KYC_contrainte',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'article 169',
          content_id: '169',
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
          description: `Retrouvez de programmes d'accompagnement sur les thématiques de la transition écologique`,
          feature: Feature.univers,
        },
      },
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Mieux vous connaître',
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
          titre: 'Mieux vous connaître',
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
          titre: 'Quizz (ID2)',
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
          titre: `Ajouter "Fruits et légumes de saison"`,
          thematiques: [Thematique.alimentation],
          progression: { current: 0, target: 1 },
          service_id: LiveService.fruits,
          sont_points_en_poche: false,
          type: ContentType.service,
          points: 20,
          level: DifficultyLevel.ANY,
        },
      ],
    },
  ];
  /**
  private static catalogue: Todo_v0[] = [
    {
      numero_todo: 1,
      points_todo: 50,
      titre: 'Votre 1ère mission',
      done_at: null,
      celebration: null,
      done: [
        {
          id: uuidv4(),
          titre: `Faire le bilan simplifié de vos impacts`,
          thematiques: [],
          progression: { current: 1, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.onboarding,
          level: null,
          points: 20,
        },
      ],
      todo: [
        {
          id: uuidv4(),
          titre: 'Réussir 1 quiz Climat',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 10,
        },
        {
          id: uuidv4(),
          titre: 'Répondre à une question pour mieux vous connaître',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
          content_id: KYCID.KYC001,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 40,
      titre: 'Mission 2',
      done_at: null,
      celebration: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Réussir 2 quiz Transport',
          thematiques: [Thematique.transport],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.ANY,
          points: 20,
        },
        {
          id: uuidv4(),
          titre:
            'Répondre à une question pour mieux vous connaître - transport',
          thematiques: [Thematique.transport],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
          content_id: KYCID.KYC004,
        },
        {
          id: uuidv4(),
          titre:
            'Répondre à une question pour mieux vous connaître - transport',
          thematiques: [Thematique.transport],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 5,
          content_id: KYCID.KYC003,
        },
      ],
    },
    {
      numero_todo: 3,
      points_todo: 60,
      titre: 'Mission 3',
      done_at: null,
      celebration: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: `Lire 2 articles Alimentation`,
          thematiques: [Thematique.alimentation],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre:
            'Répondre à une question pour mieux vous connaître - alimentation',
          thematiques: [Thematique.alimentation],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.L1,
          content_id: KYCID.KYC007,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: `Installer "Fruits et légumes de saison"`,
          thematiques: [Thematique.alimentation],
          progression: { current: 0, target: 1 },
          service_id: LiveService.fruits,
          sont_points_en_poche: false,
          type: ContentType.service,
          points: 20,
          level: DifficultyLevel.ANY,
        },
      ],
    },
    {
      numero_todo: 4,
      points_todo: 80,
      titre: 'Mission 4',
      done_at: null,
      celebration: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Répondre à une question pour mieux vous connaître - logement',
          thematiques: [Thematique.logement],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.L1,
          content_id: KYCID.KYC006,
          points: 5,
        },
        {
          id: uuidv4(),
          titre: 'Réussir 2 quiz Logement',
          thematiques: [Thematique.logement],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre:
            'Découvrir le service "Votre consommation électrique au jour le jour"',
          thematiques: [Thematique.logement],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.service,
          service_id: LiveService.linky,
          level: DifficultyLevel.ANY,
          points: 10,
        },
      ],
    },
    {
      numero_todo: 5,
      points_todo: 60,
      titre: 'Mission 5',
      done_at: null,
      celebration: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Réussir 1 quiz Consommation',
          thematiques: [Thematique.consommation],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 30,
        },
        {
          id: uuidv4(),
          titre:
            'Répondre à une question pour mieux vous connaître - consommation',
          thematiques: [Thematique.consommation],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.L1,
          points: 5,
          content_id: KYCID.KYC005,
        },
        {
          id: uuidv4(),
          titre:
            'Répondre à une question pour mieux vous connaître - transports',
          thematiques: [Thematique.consommation],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.L1,
          points: 5,
          content_id: KYCID.KYC002,
        },
        {
          id: uuidv4(),
          titre: 'Lire 1 article Déchets',
          thematiques: [Thematique.dechet],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.L1,
          points: 10,
        },
      ],
    },
  ];
  */
}
