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

  it('doit correctement calculer les aides pour une situation de base', async () => {
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

  it("doit retourner le bon montant de l'aide avec un abonnement TER à Anger ", async () => {
    // WHEN
    const result = await aidesVeloRepository.getSummaryVelos(
      '49000',
      5000,
      1,
      100,
      true,
    );

    // THEN
    expect(result['électrique'].length).toBe(3);
    const aide = result['électrique'].find((aide) => {
      if (aide.libelle === 'Région Pays de la Loire') {
        return true;
      }
    });
    expect(aide.libelle).toContain('Région Pays de la Loire');
    expect(aide.montant).toBe(50);
    expectAllMatchOneOfCollectivite(result, [
      // Check that all aides are in France, Pays de la Loire or Angers
      { kind: 'pays', value: 'France' },
      { kind: 'région', value: '52' },
      { kind: 'epci', value: 'CU Angers Loire Métropole', code: '244900015' },
    ]);
  });

  it("doit retourner le bon montant de l'aide sans un abonnement TER à Anger", async () => {
    // WHEN
    const result = await aidesVeloRepository.getSummaryVelos(
      '49000',
      5000,
      1,
      100,
      false,
    );

    // THEN
    expect(result['électrique'].length).toBe(2);
    result['électrique'].forEach((aide) => {
      expect(aide.libelle).not.toContain('Région Pays de la Loire');
    });
    expectAllMatchOneOfCollectivite(result, [
      // Check that all aides are in France, Pays de la Loire or Angers
      { kind: 'pays', value: 'France' },
      { kind: 'région', value: '52' },
      { kind: 'epci', value: 'CU Angers Loire Métropole', code: '244900015' },
    ]);
  });

  describe("Département de l'Hérault", () => {
    it('devrait avoir une aide régionale, départementale pour une personne habitant à Cazouls-Lès-Béziers', async () => {
      // WHEN
      const result = await aidesVeloRepository.getSummaryVelos(
        '34370',
        5000,
        1,
        100,
      );

      // THEN
      expect(result['électrique'].length).toBe(4);
      expect(result['électrique'][0].libelle).toBe('Bonus vélo');
      expect(result['électrique'][1].libelle).toContain('Région Occitanie');
      expect(result['électrique'][2].libelle).toContain('Département Hérault');
      expect(result['électrique'][3].libelle).toContain(
        'Ville de Cazouls-Lès-Béziers',
      );
    });
  });

  describe('Vélo adapté et personne en situation de handicap', () => {
    it.skip('doit correctement cumuler les aides pour une personne habitant à Toulouse', async () => {
      // WHEN
      const result = await aidesVeloRepository.getSummaryVelos(
        '31000',
        8000,
        1,
        500,
      );

      // THEN
      expect(result['électrique'].length).toBe(3);
      expect(result['électrique'][0].libelle).toBe('Bonus vélo');
      expect(result['électrique'][1].libelle).toBe('Région Occitanie');
      expect(result['électrique'][2].libelle).toBe('Toulouse Métropole');
      expect(result['adapté'].length).toBe(2);
      expect(result['adapté'][0].libelle).toBe('Bonus vélo');
      expect(result['adapté'][1].libelle).toContain('Région Occitanie');
      expect(result['adapté'][1].description).toContain(
        'Bonus vélo adapté PMR',
      );
    });

    it.skip('doit correctement cumuler les aides pour une personne habitant à Montpellier', async () => {
      // WHEN
      const result = await aidesVeloRepository.getSummaryVelos(
        '31000',
        8000,
        1,
        500,
      );

      // THEN
      expect(result['électrique'].length).toBe(3);
      expect(result['électrique'][0].libelle).toBe('Bonus vélo');
      expect(result['électrique'][1].libelle).toBe('Région Occitanie');
      expect(result['électrique'][2].libelle).toBe('Toulouse Métropole');
      expect(result['adapté'].length).toBe(3);
      expect(result['adapté'][0].libelle).toBe('Bonus vélo');
      expect(result['adapté'][1].libelle).toContain('Région Occitanie');
      expect(result['adapté'][1].description).toContain(
        'Bonus vélo adapté PMR',
      );
      expect(result['adapté'][2].libelle).toContain('Département Hérault');
      expect(result['adapté'][2].description).toContain(
        'Chèque Hérault Handi-Vélo',
      );
    });

    // TODO
    // it.skip(
    //   "'Hérault Handi Vélo' devrait être cumulable avec le 'Bonus vélo adapté PMR' de la région Occitanie",
    //   async () => {
    //     engine.setSituation({
    //       'localisation . département': "'34'",
    //       'revenu fiscal de référence': '10000€/an',
    //       'personne en situation de handicap': 'oui',
    //       'vélo . type': "'adapté'",
    //       'vélo . prix': '1000€',
    //     });
    //
    //     expect(
    //       engine.evaluate('aides . département hérault vélo adapté').nodeValue,
    //     ).toEqual(500);
    //     expect(
    //       engine.evaluate('aides . occitanie vélo adapté').nodeValue,
    //     ).toEqual(500);
    //   },
    // );
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
