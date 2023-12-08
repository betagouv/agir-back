import { TestUtil } from '../../TestUtil';
import { AidesVeloRepository } from '../../../src/infrastructure/repository/aidesVelo.repository';

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
    console.log(result);
    expect(result['électrique'][1].description).toContain('TER');
    expect(result['électrique'][1].montant).toBe(50);
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
    console.log(result);
    expect(result['électrique'][1].description).not.toContain('TER');
  });
});
