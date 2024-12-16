import {
  AideVelo,
  AidesVeloParType,
  Collectivite,
} from 'src/domain/aides/aideVelo';
import {
  AidesVeloRepository,
  SummaryVelosParams,
} from '../../../src/infrastructure/repository/aidesVelo.repository';
import { TestUtil } from '../../TestUtil';

describe('AideVeloRepository', () => {
  const OLD_ENV = process.env;
  let aidesVeloRepository = new AidesVeloRepository();

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  const baseParams: SummaryVelosParams = {
    'localisation . code insee': '91477', // Palaiseau
    'localisation . epci': 'CA Communauté Paris-Saclay',
    'localisation . région': '11',
    'localisation . département': '91',
    'revenu fiscal de référence par part . revenu de référence': 800,
    'revenu fiscal de référence par part . nombre de parts': 1,
    'vélo . prix': 500,
    'foyer . personnes': 1,
    'aides . pays de la loire . abonné TER': false,
  };

  it.skip('doit correctement calculer les aides pour une situation de base', async () => {
    // WHEN
    process.env.MINIATURES_URL = 'http://localhost:3000';
    const result = await aidesVeloRepository.getSummaryVelos(baseParams);

    // THEN
    expect(result['motorisation']).toEqual([
      {
        collectivite: { kind: 'région', value: '11' },
        description:
          "La région Île-de-France subventionne l'achat d'un kit de motorisation à hauteur de 50% et jusqu'à un plafond de 200 €.",
        libelle: 'Île-de-France Mobilités',
        lien: 'https://www.iledefrance-mobilites.fr/le-reseau/services-de-mobilite/velo/prime-achat-velo',
        logo: 'http://localhost:3000/logo_ile_de_france.webp',
        montant: 200,
        plafond: 200,
      },
    ]);

    // Check that all aides are in Île-de-France or France
    expectAllMatchOneOfCollectivite(result, [
      { kind: 'pays', value: 'France' },
      { kind: 'région', value: '11' },
    ]);
  });

  it("doit retourner le bon montant de l'aide avec un abonnement TER à Anger ", async () => {
    // WHEN
    const result = await aidesVeloRepository.getSummaryVelos({
      ...baseParams,
      'localisation . code insee': '49007', // Angers
      'localisation . epci': 'CU Angers Loire Métropole',
      'localisation . département': '49',
      'localisation . région': '52',
      'aides . pays de la loire . abonné TER': true,
      'revenu fiscal de référence par part . revenu de référence': 5000,
      'vélo . prix': 100,
    });

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
    const result = await aidesVeloRepository.getSummaryVelos({
      ...baseParams,
      'localisation . code insee': '49007', // Angers
      'localisation . epci': 'CU Angers Loire Métropole',
      'localisation . département': '49',
      'localisation . région': '52',
      'aides . pays de la loire . abonné TER': false,
    });

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
      const result = await aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '34069', // Cazouls-Lès-Béziers
        'localisation . epci': 'CC la Domitienne',
        'localisation . département': '34',
        'localisation . région': '76',
        'aides . pays de la loire . abonné TER': false,
      });

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
      const result = await aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '31555', // Toulouse
        'localisation . epci': 'Toulouse Métropole',
        'localisation . département': '31',
        'localisation . région': '76',
        'aides . pays de la loire . abonné TER': false,
      });

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
      const result = await aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '34172', // Montpellier
        'localisation . epci': 'Montpellier Méditerranée Métropole',
        'localisation . département': '34',
        'localisation . région': '76',
        'aides . pays de la loire . abonné TER': false,
      });

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
  });

  it('Villefranche Agglomération Beaujolais Saône', async () => {
    // WHEN
    const result = await aidesVeloRepository.getSummaryVelos({
      ...baseParams,
      'localisation . code insee': '69264', // Villefranche-sur-Saône
      'localisation . epci': 'CA Villefranche Beaujolais Saône',
      'localisation . département': '69',
      'localisation . région': '84',
      'aides . pays de la loire . abonné TER': false,
    });

    // THEN
    forEachAide(result, (aide: AideVelo) => {
      expect(aide.montant).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * Check that all aides are in one of the provided collectivite.
 */
function expectAllMatchOneOfCollectivite(
  aides: AidesVeloParType,
  collectivites: Collectivite[],
) {
  forEachAide(aides, (aide) => {
    expect(collectivites).toContainEqual<Collectivite>(aide.collectivite);
  });
}

function forEachAide(aides: AidesVeloParType, f: (aide: AideVelo) => void) {
  Object.values(aides).flat().forEach(f);
}
