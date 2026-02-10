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
      test.skip('devrait avoir une aide régionale, départementale pour une personne habitant à Cazouls-Lès-Béziers', () => {
        // FIXME : tests trop dépendants du contenu aides vélo à un instant T (package externe)
        // En fait on test un peu aide-velo là...
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
      test.skip('doit correctement cumuler les aides pour une personne habitant à Toulouse', () => {
        // FIXME : tests trop dépendants du contenu aides vélo à un instant T (package externe)
        // En fait on test un peu aide-velo là...
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

      test.skip('doit correctement cumuler les aides pour une personne habitant à Montpellier', () => {
        // FIXME : tests trop dépendants du contenu aides vélo à un instant T (package externe)
        // En fait on test un peu aide-velo là...
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
        expect(result['adapté'][1].libelle).toContain('Département Hérault');
        expect(result['adapté'][1].description).toContain(
          'Chèque Hérault Handi-Vélo',
        );
        expect(result['adapté'][0].libelle).toContain('Région Occitanie');
        expect(result['adapté'][0].description).toContain('adapté');
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

    test.skip('doit retourner toutes les aides (nationales et locales) pour la commune de Montpellier', () => {
      // WHEN
      const result = aidesVeloRepository.getAllAidesIn({
        'localisation . pays': 'France',
        'localisation . epci': 'Montpellier Méditerranée Métropole',
        'localisation . code insee': '34172',
        'localisation . région': '76',
        'localisation . département': '34',
      });

      // THEN
      expect(result).toEqual([
        {
          libelle: 'Région Occitanie',
          lien: 'https://www.laregion.fr/Eco-cheque-mobilite-velo-a-assistance-electrique',
          collectivite: { kind: 'région', value: '76' },
          description:
            "« Éco-chèque mobilité » - Achat d’un vélo à assistance électrique neuf. Aide de 200 € pour l'achat d'un vélo à assistance électrique neuf.\n" +
            '\n' +
            "La demande doit être effectuée dans les 6 mois suivant la date d'achat du vélo.",
          logo: 'undefined/logo_occitanie.webp',
        },
        {
          libelle: 'Région Occitanie',
          lien: 'https://www.laregion.fr/Eco-cheque-mobilite-Bonus-velo-adapte-PMR',
          collectivite: { kind: 'région', value: '76' },
          description: '« Éco-chèque mobilité » - Bonus vélo adapté PMR.',
          logo: 'undefined/logo_occitanie.webp',
        },
        {
          libelle: 'Région Occitanie',
          lien: 'https://www.laregion.fr/Eco-cheque-mobilite-Bonus-forfait-mobilite-durable',
          collectivite: { kind: 'région', value: '76' },
          description:
            "« Éco-chèque mobilité » - Bonus forfait mobilité durable. Aide pour l'achat d'un cycle neuf (électrique ou mécanique) par les salarié·es pouvant justifier percevoir de son employeur le Forfait Mobilités Durables.\n" +
            '\n' +
            'Dispositif non-cumulable avec les autres aides « Éco-chèque mobilité » de la région.',
          logo: 'undefined/undefined',
        },
        {
          libelle: 'Montpellier Méditerranée Métropole',
          lien: 'https://www.montpellier3m.fr/vivre-transport/toutes-les-aides-pour-lachat-ou-la-reparation-de-velos',
          collectivite: {
            kind: 'epci',
            value: 'Montpellier Méditerranée Métropole',
            code: '243400017',
          },
          description:
            "Jusqu'à 1000€ d'aide pour l'achat d'un vélo cargo ou triporteur à assistance électrique neuf pour les professionnel·les en activités sur le territoire de Montpellier Méditerranée Métropole.",
          logo: 'undefined/undefined',
        },
        {
          libelle: 'Montpellier Méditerranée Métropole',
          lien: 'https://www.montpellier3m.fr/vivre-transport/toutes-les-aides-pour-lachat-ou-la-reparation-de-velos',
          collectivite: {
            kind: 'epci',
            value: 'Montpellier Méditerranée Métropole',
            code: '243400017',
          },
          description:
            "Une subvention d'un montant de 200 € maximum, sans condition de ressource, sera versée à tous les habitants de la Métropole de plus de 18 ans qui feront l'acquisition d'un vélo à assistance électrique d'occasion (VAE) à partir du 1er février 2021 ou l'achat d'un kit d'électrification à partir du 29 juillet 2021 dans un magasin de la métropole jusqu'au 31 décembre 2026.",
          logo: 'undefined/undefined',
        },
      ]);
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
