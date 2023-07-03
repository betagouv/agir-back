import { TestUtil } from '../../TestUtil';
import { InteractionRepository } from '../../../src/infrastructure/repository/interaction.repository';
import { SuiviRepas } from '../../../src/domain/suivi/suiviRepas';

describe('InteractionRepository', () => {
  let interactionRepository = new InteractionRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('desc order by reco score ', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });
    await TestUtil.prisma.interaction.createMany({
      data: [
        {
          id: '1',
          type: 'A',
          titre: 'A',
          categorie: 'A',
          difficulty: 1,
          points: 5,
          reco_score: 100,
          utilisateurId: '123',
        },
        {
          id: '2',
          type: 'B',
          titre: 'B',
          categorie: 'B',
          difficulty: 1,
          points: 5,
          reco_score: 20,
          utilisateurId: '123',
        },
        {
          id: '3',
          type: 'C',
          titre: 'C',
          categorie: 'C',
          difficulty: 1,
          points: 5,
          reco_score: 50,
          utilisateurId: '123',
        },
      ],
    });

    const liste = await interactionRepository.listInteractionsByUtilisateurId(
      '123',
    );
    expect(liste).toHaveLength(3);
    expect(liste[0].reco_score).toEqual(20);
    expect(liste[1].reco_score).toEqual(50);
    expect(liste[2].reco_score).toEqual(100);
  });
});
