import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { Thematique } from '../../../src/domain/thematique';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';
import { TodoRepository } from '../../../src/infrastructure/repository/todo.repository';
import { TodoCatalogue } from '../../../src/domain/todo/todoCatalogue';
import {
  LiveService,
  ScheduledService,
} from '../../../src/domain/service/serviceDefinition';
import { Todo } from '../../../src/domain/todo/todo';

describe('Linky (API test)', () => {
  let todoRepository = new TodoRepository(TestUtil.prisma);
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /utilisateurs/id/linky_souscription renvoie OK', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/linky_souscription',
    );

    // THEN
    expect(response.status).toBe(200);
  });
});
