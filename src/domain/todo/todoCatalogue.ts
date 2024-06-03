import { DifficultyLevel } from '../contenu/difficultyLevel';
import { ContentType } from '../contenu/contentType';
import { Thematique } from '../contenu/thematique';
import { Todo } from './todo';
import { v4 as uuidv4 } from 'uuid';
import { LiveService } from '../service/serviceDefinition';
import { Todo_v0 } from '../object_store/parcoursTodo/parcoursTodo_v0';
import { KYCID } from '../kyc/KYCID';

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
      points_todo: 50,
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
}
