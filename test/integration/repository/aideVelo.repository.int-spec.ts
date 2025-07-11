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
    'vélo . état': 'neuf',
    'demandeur . en situation de handicap': false,
    'demandeur . âge': 30,
  };

  describe('getSummaryVelos', () => {
    test('doit correctement calculer les aides pour une situation de base', () => {
      // WHEN
      process.env.MINIATURES_URL = 'http://localhost:3000';
      const result = aidesVeloRepository.getSummaryVelos(baseParams);

      // THEN
      expect(result['motorisation']).toEqual([
        {
          collectivite: { kind: 'région', value: '11' },
          description:
            "Aide financière pour l'achat de vélos à assistance électrique, de vélos mécanique (pour les moins de 25 ans) et de vélos adaptés. Neuf ou d'occasion.",
          libelle: 'Île-de-France Mobilités',
          lien: 'https://www.iledefrance-mobilites.fr/le-reseau/services-de-mobilite/velo/prime-achat-velo',
          logo: 'http://localhost:3000/logo_ile_de_france.webp',
          montant: 200,
          plafond: 200,
        },
      ]);

      // Check that all aides are in Île-de-France or France
      expectAllMatchOneOfCollectivite(result, [
        { kind: 'région', value: '11' },
      ]);
    });

    test.skip("doit retourner le bon montant de l'aide avec un abonnement TER à Anger ", () => {
      // WHEN
      const result = aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '49007', // Angers
        'localisation . epci': 'CU Angers Loire Métropole',
        'localisation . département': '49',
        'localisation . région': '52',
        // 'aides . pays de la loire . abonné TER': true,
        'revenu fiscal de référence par part . revenu de référence': 5000,
        'vélo . prix': 100,
      });

      // THEN
      expect(result['électrique'].length).toBe(2);
      const aide = result['électrique'].find((aide) => {
        if (aide.libelle === 'Région Pays de la Loire') {
          return true;
        }
      });
      expect(aide.libelle).toContain('Région Pays de la Loire');
      expect(aide.montant).toBe(50);
      expectAllMatchOneOfCollectivite(result, [
        { kind: 'région', value: '52' },
        { kind: 'epci', value: 'CU Angers Loire Métropole', code: '244900015' },
      ]);
    });

    test.skip("doit retourner le bon montant de l'aide sans un abonnement TER à Anger", () => {
      // WHEN
      const result = aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '49007', // Angers
        'localisation . epci': 'CU Angers Loire Métropole',
        'localisation . département': '49',
        'localisation . région': '52',
        // 'aides . pays de la loire . abonné TER': false,
      });

      // THEN
      expect(result['électrique'].length).toBe(1);
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
      test('devrait avoir une aide régionale, départementale pour une personne habitant à Cazouls-Lès-Béziers', () => {
        // WHEN
        const result = aidesVeloRepository.getSummaryVelos({
          ...baseParams,
          'localisation . code insee': '34069', // Cazouls-Lès-Béziers
          'localisation . epci': 'CC la Domitienne',
          'localisation . département': '34',
          'localisation . région': '76',
        });

        // THEN
        expect(result['électrique'].length).toBe(3);
        expect(result['électrique'][0].libelle).toContain('Région Occitanie');
        expect(result['électrique'][1].libelle).toContain(
          'Département Hérault',
        );
        expect(result['électrique'][2].libelle).toContain(
          'Ville de Cazouls-Lès-Béziers',
        );
      });
    });

    describe('Vélo adapté et personne en situation de handicap', () => {
      test('doit correctement cumuler les aides pour une personne habitant à Toulouse', () => {
        // WHEN
        const result = aidesVeloRepository.getSummaryVelos({
          ...baseParams,
          'localisation . code insee': '31555', // Toulouse
          'localisation . epci': 'Toulouse Métropole',
          'localisation . département': '31',
          'localisation . région': '76',
          'demandeur . en situation de handicap': true,
        });

        // THEN
        expect(result['électrique'].length).toBe(2);
        expect(result['électrique'][0].libelle).toBe('Région Occitanie');
        expect(result['électrique'][1].libelle).toBe('Toulouse Métropole');
        expect(result['adapté'].length).toBe(1);
        expect(result['adapté'][0].libelle).toContain('Région Occitanie');
        expect(result['adapté'][0].description).toContain(
          'Éco-chèque mobilité - Bonus vélo adapté PMR',
        );
      });

      test('doit correctement cumuler les aides pour une personne habitant à Montpellier', () => {
        // WHEN
        const result = aidesVeloRepository.getSummaryVelos({
          ...baseParams,
          'localisation . code insee': '34172', // Montpellier
          'localisation . epci': 'Montpellier Méditerranée Métropole',
          'localisation . département': '34',
          'localisation . région': '76',
          'demandeur . en situation de handicap': true,
        });

        // THEN
        expect(result['électrique'].length).toBe(2);
        expect(result['électrique'][0].libelle).toBe('Région Occitanie');
        expect(result['électrique'][1].libelle).toBe('Département Hérault');
        expect(result['adapté'].length).toBe(2);
        expect(result['adapté'][0].libelle).toContain('Département Hérault');
        expect(result['adapté'][0].description).toContain(
          'Chèque Hérault Handi-Vélo',
        );
        expect(result['adapté'][1].libelle).toContain(
          'Montpellier Méditerranée Métropole',
        );
        expect(result['adapté'][1].description).toContain('adapté');
      });
    });

    test('Villefranche Agglomération Beaujolais Saône', () => {
      // WHEN
      const result = aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '69264', // Villefranche-sur-Saône
        'localisation . epci': 'CA Villefranche Beaujolais Saône',
        'localisation . département': '69',
        'localisation . région': '84',
      });

      // THEN
      forEachAide(result, (aide: AideVelo) => {
        expect(aide.montant).toBeGreaterThanOrEqual(0);
      });
    });

    test("seul les personnes de 15 à 25 ans sont éligibles à l'aide pour l'achat d'un vélo mécanique en Ile-de-France", () => {
      // WHEN
      let result = aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '91477', // Palaiseau
        'localisation . epci': 'CA Communauté Paris-Saclay',
        'localisation . région': '11',
        'localisation . département': '91',
      });

      // THEN
      expect(result['mécanique simple'].length).toBe(0);

      result = aidesVeloRepository.getSummaryVelos({
        ...baseParams,
        'localisation . code insee': '91477', // Palaiseau
        'localisation . epci': 'CA Communauté Paris-Saclay',
        'localisation . région': '11',
        'localisation . département': '91',
        'demandeur . âge': 20,
      });

      // THEN
      expect(result['mécanique simple'].length).toBe(1);
    });
  });

  describe('getAllAidesIn', () => {
    test("doit uniquement l'aide de la région Île-de-France", () => {
      // WHEN
      const result = aidesVeloRepository.getAllAidesIn({
        'localisation . région': '11',
      });

      // THEN
      expect(result.length).toBe(1);
      expect(result[0].libelle).toEqual('Île-de-France Mobilités');
    });

    test('ne doit retourner aucunes aides pour la commune de Dijon', () => {
      // WHEN
      const result = aidesVeloRepository.getAllAidesIn({
        'localisation . code insee': '21231',
      });

      // THEN
      expect(result.length).toBe(0);
    });

    test('ne doit retourner aucunes aides pour la commune de Dijon', () => {
      // WHEN
      const result = aidesVeloRepository.getAllAidesIn({
        'localisation . code insee': '21231',
      });

      // THEN
      expect(result.length).toBe(0);
    });

    test('doit retourner toutes les aides (nationales et locales) pour la commune de Montpellier', () => {
      // WHEN
      const result = aidesVeloRepository.getAllAidesIn({
        'localisation . pays': 'France',
        'localisation . epci': 'Montpellier Méditerranée Métropole',
        'localisation . code insee': '34172',
        'localisation . région': '76',
        'localisation . département': '34',
      });

      // THEN
      expect(result.length).toBe(6);
      expect(result[0].libelle).toContain('Région Occitanie');
      expect(result[0].description).toContain(
        "Achat d'un vélo à assistance électrique",
      );
      expect(result[1].libelle).toContain('Région Occitanie');
      expect(result[1].description).toContain('Bonus vélo adapté PMR');
      expect(result[2].libelle).toContain('Département Hérault');
      expect(result[3].libelle).toContain('Département Hérault');
      expect(result[3].description).toContain('Chèque Hérault Handi-Vélo');
      expect(result[4].libelle).toContain('Montpellier Méditerranée Métropole');
      expect(result[4].description).toContain("vélo électrique ou d'occasion");
      expect(result[5].libelle).toContain('Montpellier Méditerranée Métropole');
      expect(result[5].description).toContain(
        'personnes en situation de handicap',
      );
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
