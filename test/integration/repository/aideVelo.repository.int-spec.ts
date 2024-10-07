import { TestUtil } from '../../TestUtil';
import { AidesVeloRepository } from '../../../src/infrastructure/repository/aidesVelo.repository';
import { AidesVeloParType, Collectivite } from 'src/domain/aides/aideVelo';

describe('AideVeloRepository', () => {
  let aidesVeloRepository = new AidesVeloRepository();

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('getSummaryVelos : calcul de base OK', async () => {
    // WHEN
    const result = await aidesVeloRepository.getSummaryVelos(
      '91120',
      10000,
      2.5,
      500,
    );

    // THEN
    expect(result['motorisation'][0].libelle).toBe('Île-de-France Mobilités');
    expect(result['motorisation'][0].montant).toBe(200);

    // Check that all aides are in Île-de-France or France
    expectAllMatchOneOfCollectivite(result, [
      { kind: 'pays', value: 'France' },
      { kind: 'région', value: '11' },
    ]);
  });

  it('getSummaryVelos : avec abonnement TER à Anger', async () => {
    // WHEN
    const result = await aidesVeloRepository.getSummaryVelos(
      '49000',
      5000,
      1,
      100,
      true,
    );

    // THEN
    expect(result['électrique'][1].description).toContain('TER');
    expect(result['électrique'][1].montant).toBe(50);
    expectAllMatchOneOfCollectivite(result, [
      // Check that all aides are in France, Pays de la Loire or Angers
      { kind: 'pays', value: 'France' },
      { kind: 'région', value: '52' },
      { kind: 'epci', value: 'CU Angers Loire Métropole', code: '244900015' },
    ]);
  });

  it('getSummaryVelos : sans abonnement TER à Anger', async () => {
    // WHEN
    const result = await aidesVeloRepository.getSummaryVelos(
      '49000',
      5000,
      1,
      100,
      false,
    );

    // THEN
    expect(result['électrique'][1].description).not.toContain('TER');
    expectAllMatchOneOfCollectivite(result, [
      // Check that all aides are in France, Pays de la Loire or Angers
      { kind: 'pays', value: 'France' },
      { kind: 'région', value: '52' },
      { kind: 'epci', value: 'CU Angers Loire Métropole', code: '244900015' },
    ]);
  });
});

/**
 * Check that all aides are in one of the provided collectivite.
 */
function expectAllMatchOneOfCollectivite(
  aides: AidesVeloParType,
  collectivites: Collectivite[],
) {
  Object.values(aides)
    .flat()
    .forEach((aide) => {
      expect(collectivites).toContainEqual<Collectivite>(aide.collectivite);
    });
}
