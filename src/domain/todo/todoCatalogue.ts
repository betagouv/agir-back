import { DifficultyLevel } from '../contenu/difficultyLevel';
import { ContentType } from '../contenu/contentType';
import { Thematique } from '../contenu/thematique';
import { Todo } from './todo';
import { v4 as uuidv4 } from 'uuid';
import { LiveService } from '../service/serviceDefinition';
import { Todo_v0 } from '../object_store/parcoursTodo/parcoursTodo_v0';

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
      done_at: null,
      done: [],
      todo: [],
    });
    result.is_last = true;
    return result;
  }

  private static catalogue: Todo_v0[] = [
    {
      numero_todo: 1,
      points_todo: 30,
      titre: 'Votre 1ère mission',
      done_at: null,
      done: [
        {
          id: uuidv4(),
          titre: `Faire le bilan simplifié de vos impacts`,
          thematiques: [],
          progression: { current: 1, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.onboarding,
          level: null,
          points: 10,
        },
      ],
      todo: [
        {
          id: uuidv4(),
          titre: 'Réussir 1 quiz Climat - très facile',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 20,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 30,
      titre: 'Mission 2',
      done_at: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Réussir 2 quiz Climat - très facile',
          thematiques: [Thematique.climat],
          progression: { current: 1, target: 2 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre: 'Lire un article Transports - très facile',
          thematiques: [Thematique.transport],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.L1,
          points: 20,
        },
      ],
    },
    {
      numero_todo: 3,
      points_todo: 30,
      titre: 'Mission 3',
      done_at: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: `Réussir 2 quiz Transports - très facile`,
          thematiques: [Thematique.transport],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre: 'Lire un article Alimentation - très facile',
          thematiques: [Thematique.alimentation],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.L1,
          points: 20,
        },
      ],
    },
    {
      numero_todo: 4,
      points_todo: 30,
      titre: 'Mission 4',
      done_at: null,
      done: [],
      todo: [
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
        {
          id: uuidv4(),
          titre: `Réussir 3 quiz Logement - très facile`,
          thematiques: [Thematique.logement],
          progression: { current: 0, target: 3 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 20,
        },
      ],
    },
    {
      numero_todo: 5,
      points_todo: 30,
      titre: 'Mission 5',
      done_at: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Lire un article Consommation - très facile',
          thematiques: [Thematique.consommation],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre: 'Réussir 3 quiz Consommation - très facile',
          thematiques: [Thematique.consommation],
          progression: { current: 0, target: 3 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre: 'Lire un article Déchets - très facile',
          thematiques: [Thematique.dechet],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.L1,
          points: 20,
        },
      ],
    },
    {
      numero_todo: 6,
      points_todo: 30,
      titre: 'Mission 6',
      done_at: null,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Réussir un quizz Déchets - très facile',
          thematiques: [Thematique.dechet],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.quizz,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre: 'Lire un article Climat - très facile',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.article,
          level: DifficultyLevel.L1,
          points: 20,
        },
        {
          id: uuidv4(),
          titre: 'Répondre à une question pour mieux vous connaître',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: ContentType.kyc,
          level: DifficultyLevel.ANY,
          points: 20,
          content_id: 'KYC001',
        },
      ],
    },
  ];
}
