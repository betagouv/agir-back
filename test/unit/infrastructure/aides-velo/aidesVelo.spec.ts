import Engine from 'publicodes';
import rules from '../../../../src/infrastructure/data/aidesVelo.json';
import collectivites from '../../../../src/infrastructure/data/aides-collectivities.json';
import miniatures from '../../../../src/infrastructure/data/miniatures.json';
import assert from 'assert';

describe('Aides Vélo', () => {
  const engine = new Engine(rules);

  describe('Généralités', () => {
    const rulesToIgnore = [
      'aides . montant',
      'aides . état',
      'aides . région',
      'aides . département',
      'aides . commune',
      'aides . intercommunalité',
      'aides . forfait mobilités durables',
    ];

    it("devrait y avoir une entrée pour chaque aide dans le fichier 'aides-collectivities.json'", () => {
      // NOTE: should be generated at compile time
      const noNeedToAssociatesLoc = [
        ...rulesToIgnore,
        'aides . bonus vélo',
        'aides . prime à la conversion',
      ];

      Object.keys(rules).forEach((key) => {
        if (
          key.startsWith('aides .') &&
          key.split(' . ').length === 2 &&
          !noNeedToAssociatesLoc.includes(key)
        ) {
          expect(collectivites[key]).not.toBeUndefined();
        }
      });
    });

    it.skip("'devrait y avoir une entrée pour chaque aide dans 'miniatures.json'", () => {
      // NOTE: should be generated at compile time
      // TODO: improve the generation script to manage missing cities
      Object.keys(rules).forEach((key) => {
        if (
          key.startsWith('aides .') &&
          key.split(' . ').length === 2 &&
          !rulesToIgnore.includes(key)
        ) {
          if (!miniatures[key]) {
            console.log(key);
          }
          expect(miniatures[key]).not.toBeUndefined();
        }
      });
    });

    it('devrait y avoir un lien valide pour chaque aides', () => {
      Object.entries(rules).forEach(([key, rule]) => {
        if (
          key.startsWith('aides .') &&
          key.split(' . ').length === 2 &&
          !rulesToIgnore.includes(key)
        ) {
          if (!rule['lien']) {
            console.log(key);
          }
          expect(rule['lien']).toMatch(/^https?:\/\//);
        }
      });
    });
  });

  describe('Bonus Vélo', () => {
    const baseSituation = {
      'localisation . code insee': "'75056'",
      'localisation . epci': "'Métropole du Grand Paris'",
      'localisation . région': "'11'",
    };

    it('ne devrait pas être accordé pour un revenu fiscal de référence > 15 400 €/an', () => {
      // Set base situation
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
        'vélo . type': "'électrique'",
      });

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(null);
    });

    it('devrait être accordée pour les personnes en situation de handicap quelque soit le revenu fiscal de référence', () => {
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'adapté'",
        'vélo . prix': '2500€',
      });
      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(1000);

      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(2000);

      // Personne en situation de handicap sans vélo adapté
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'mécanique simple'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(150);
    });

    it('ne devrait correctement prendre en compte les vélo adaptés pour les personnes qui ne sont PAS en situation de handicap', () => {
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(null);

      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(1000);

      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '2000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(2000);
    });

    it('revenu fiscal de référence < 15 400 €/an pour un vélo électrique de 1000€', () => {
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '15400€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
      });
      const expectedAmount = Math.min(1000 * 0.4, 300);

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(
        expectedAmount,
      );
    });

    it('revenu fiscal de référence < 7100 €/an pour un vélo électrique de 1000€', () => {
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '7100€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
      });
      const expectedAmount = Math.min(1000 * 0.4, 400);

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(
        expectedAmount,
      );
    });

    it("ne devrait pas avoir d'aide pour revenu fiscal de référence > 7100 €/an pour un vélo clasique", () => {
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'mécanique simple'",
      });

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(0);
    });

    it('ne devrait pas être accordée pour les kits de motorisation', () => {
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'motorisation'",
      });

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(null);
    });
  });

  describe('Île-de-France Mobilités', () => {
    it('devrait être nulle pour un vélo mécanique si la personne a plus de 25 ans', () => {
      engine.setSituation({
        'localisation . région': "'11'",
        'vélo . type': "'mécanique simple'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . ile de france').nodeValue).toEqual(0);
    });

    it('devrait être non nulle pour un vélo mécanique est âgée de 15 à 25 ans', () => {
      engine.setSituation({
        'localisation . région': "'11'",
        'vélo . type': "'mécanique simple'",
        'vélo . prix': '1000€',
        'demandeur . âge': '20 an',
      });
      expect(engine.evaluate('aides . ile de france').nodeValue).toEqual(100);
    });
  });

  describe('Ville de Paris', () => {
    it('devrait fournir une aide pour les vélos mécaniques', () => {
      engine.setSituation({
        'localisation . code insee': "'75056'",
        'revenu fiscal de référence': '5000€/an',
        'vélo . type': "'mécanique simple'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . paris').nodeValue).toEqual(100);
    });
  });

  describe("Département Côte-d'Or", () => {
    it('plus de subvention pour les vélos assemblés ou produit localement', () => {
      const coteDorSituation = {
        'vélo . type': "'électrique'",
        'localisation . département': "'21'",
        'vélo . prix': '500€',
      };

      engine.setSituation(coteDorSituation);
      expect(engine.evaluate("aides . cote d'or").nodeValue).toEqual(250);

      engine.setSituation({
        ...coteDorSituation,
        // TODO: use generated types instead of the json
        // @ts-ignore
        "aides . cote d'or . vélo assemblé ou produit localement": 'oui',
      });
      expect(engine.evaluate("aides . cote d'or").nodeValue).toEqual(350);
    });
  });

  describe('Région Occitanie', () => {
    it("ne devrait pas avoir de plafond pour l'Eco-chèque mobilité", () => {
      engine.setSituation({
        'localisation . région': "'76'",
        'revenu fiscal de référence': '8000€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '100€',
      });
      expect(engine.evaluate('aides . occitanie').nodeValue).toEqual(200);
    });

    it('devrait correctement prendre en compte les vélo adaptés pour les personnes en situation de handicap', () => {
      engine.setSituation({
        'localisation . région': "'76'",
        'revenu fiscal de référence': '8000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'adapté'",
        'vélo . prix': '1000€',
      });

      const aideEtat = engine.evaluate('aides . état').nodeValue;
      assert(typeof aideEtat === 'number');
      expect(aideEtat).toEqual(400);

      const expectedAmount = 0.5 * (1000 - aideEtat);
      expect(
        engine.evaluate('aides . occitanie vélo adapté').nodeValue,
      ).toEqual(expectedAmount);

      engine.setSituation({
        'localisation . région': "'76'",
        'revenu fiscal de référence': '8000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(
        engine.evaluate('aides . occitanie vélo adapté').nodeValue,
      ).toEqual(1000);
    });
  });

  describe('Toulouse Métropole', () => {
    it('devrait correctement arrondir la valeur', () => {
      engine.setSituation({
        'localisation . epci': "'Toulouse Métropole'",
        'revenu fiscal de référence': '8000€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '500€',
      });

      expect(engine.evaluate('aides . toulouse').nodeValue).toEqual(167);
    });

    it("devrait considérer la transformation en VAE de la même façon que l'achat d'une VAE", () => {
      engine.setSituation({
        'localisation . epci': "'Toulouse Métropole'",
        'revenu fiscal de référence': '8000€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . toulouse').nodeValue).toEqual(250);

      engine.setSituation({
        'localisation . epci': "'Toulouse Métropole'",
        'revenu fiscal de référence': '8000€/an',
        'vélo . type': "'motorisation'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . toulouse').nodeValue).toEqual(250);

      engine.setSituation({
        'localisation . epci': "'Toulouse Métropole'",
        'revenu fiscal de référence': '20000€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . toulouse').nodeValue).toEqual(200);

      engine.setSituation({
        'localisation . epci': "'Toulouse Métropole'",
        'revenu fiscal de référence': '20000€/an',
        'vélo . type': "'motorisation'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . toulouse').nodeValue).toEqual(200);
    });
  });

  describe('Nantes Métropole', () => {
    it('devrait correctement prendre en compte le revenu fiscale de référence en €/mois', () => {
      engine.setSituation({
        'localisation . epci': "'Nantes Métropole'",
        'revenu fiscal de référence': '700€/mois',
        'vélo . type': "'cargo'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . nantes').nodeValue).toEqual(500);

      engine.setSituation({
        'localisation . epci': "'Nantes Métropole'",
        'revenu fiscal de référence': '8400€/an',
        'vélo . type': "'cargo'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . nantes').nodeValue).toEqual(500);
    });
  });

  describe('Ville de Paris', () => {
    it('devrait correctement prendre en compte les vélo adaptés pour les personnes en situation de handicap', () => {
      engine.setSituation({
        'localisation . code insee': "'75056'",
        'revenu fiscal de référence': '5000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '1000€',
      });

      expect(engine.evaluate('aides . paris').nodeValue).toEqual(275);

      engine.setSituation({
        'localisation . code insee': "'75056'",
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . paris').nodeValue).toEqual(900);
    });
  });

  describe('Département Hérault', () => {
    it('devrait correctement prendre en compte les vélo adaptés pour les personnes en situation de handicap', () => {
      engine.setSituation({
        'localisation . département': "'34'",
        'revenu fiscal de référence': '10000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'adapté'",
        'vélo . prix': '1000€',
      });

      expect(engine.evaluate('aides . département hérault').nodeValue).toEqual(
        null,
      );
      expect(
        engine.evaluate('aides . département hérault vélo adapté').nodeValue,
      ).toEqual(500);

      engine.setSituation({
        'localisation . département': "'34'",
        'revenu fiscal de référence': '10000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . département hérault').nodeValue).toEqual(
        null,
      );
      expect(
        engine.evaluate('aides . département hérault vélo adapté').nodeValue,
      ).toEqual(1000);
    });
  });

  describe('Montpellier Méditerranée Métropole', () => {
    it("devrait être élligible uniquement pour les vélo électrique d'occasion et les kits de motorisation", () => {
      engine.setSituation({
        'localisation . epci': "'Montpellier Méditerranée Métropole'",
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . montpellier').nodeValue).toEqual(null);

      engine.setSituation({
        'localisation . epci': "'Montpellier Méditerranée Métropole'",
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . montpellier').nodeValue).toEqual(200);

      engine.setSituation({
        'localisation . epci': "'Montpellier Méditerranée Métropole'",
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'motorisation'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . montpellier').nodeValue).toEqual(200);
    });

    it("ne devrait pas être cumulable avec l'aide vélo adapté", () => {
      engine.setSituation({
        'localisation . epci': "'Montpellier Méditerranée Métropole'",
        'localisation . département': "'34'",
        'revenu fiscal de référence': '10000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . type': "'adapté'",
        'vélo . prix': '2000€',
      });

      expect(engine.evaluate('aides . montpellier').nodeValue).toEqual(null);
      expect(
        engine.evaluate('aides . montpellier vélo adapté').nodeValue,
      ).toEqual(500);
      expect(
        engine.evaluate('aides . département hérault vélo adapté').nodeValue,
      ).toEqual(1000);
    });
  });

  describe('Perpignan Méditerrannée Métropole" ', () => {
    it("devrait être élligible pour les vélo d'occasion", () => {
      engine.setSituation({
        'localisation . epci': "'CU Perpignan Méditerranée Métropole'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
      });

      expect(engine.evaluate('aides . perpignan métropole').nodeValue).toEqual(
        250,
      );
    });

    it('devrait être majorée pour les étudiant·es', () => {
      engine.setSituation({
        'localisation . epci': "'CU Perpignan Méditerranée Métropole'",
        'vélo . type': "'électrique'",
        'demandeur . statut étudiant': 'oui',
        'vélo . prix': '1000€',
      });

      expect(engine.evaluate('aides . perpignan métropole').nodeValue).toEqual(
        350,
      );
    });

    it('devrait correctement prendre en compte les vélo adaptés pour les personnes en situation de handicap', () => {
      engine.setSituation({
        'localisation . epci': "'CU Perpignan Méditerranée Métropole'",
        'vélo . type': "'adapté'",
        'demandeur . statut étudiant': 'oui',
        'vélo . prix': '1000€',
      });

      expect(engine.evaluate('aides . perpignan métropole').nodeValue).toEqual(
        1000,
      );
    });
  });

  describe('Communauté d’Agglomération Sophia Antipolis', () => {
    it('aides sans condition de revenu pour les vélos cargo ou adaptés', () => {
      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'cargo'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '20000€/an',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(
        250,
      );

      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'adapté'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '20000€/an',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(
        250,
      );
    });

    it('aides majorées pour les personnes en situation de handicap', () => {
      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'électrique'",
        'vélo . prix': '2000€',
        'revenu fiscal de référence': '20000€/an',
        'demandeur . en situation de handicap': 'oui',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(
        400,
      );

      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'adapté'",
        'vélo . prix': '10000€',
        'revenu fiscal de référence': '20000€/an',
        'demandeur . en situation de handicap': 'oui',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(
        750,
      );
    });

    it('aide nulle pour les vélos mécaniques simples avec un revenu fiscal de référence > 6358 €/an', () => {
      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'mécanique simple'",
        'vélo . prix': '300€',
        'revenu fiscal de référence': '15000€/an',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(
        null,
      );

      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'pliant'",
        'vélo . prix': '300€',
        'revenu fiscal de référence': '15000€/an',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(
        null,
      );
    });
  });

  describe('Communauté de communes Fier et Usses', () => {
    it("devrait être élligible pour les vélo d'occasion", () => {
      engine.setSituation({
        'localisation . epci': "'CC Fier et Usses'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });

      expect(engine.evaluate('aides . fier et usses').nodeValue).toEqual(400);
    });
  });

  describe('Pays de Cruseilles', () => {
    it("devrait être élligible pour les vélo d'occasion", () => {
      engine.setSituation({
        'localisation . epci': "'CC du Pays de Cruseilles'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });

      expect(engine.evaluate('aides . pays de cruseilles').nodeValue).toEqual(
        300,
      );
    });
  });

  describe('Bourges Plus', () => {
    it("devrait être élligible pour les vélo d'occasion", () => {
      engine.setSituation({
        'localisation . epci': "'CA Bourges Plus'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });

      expect(engine.evaluate('aides . bourges').nodeValue).toEqual(200);
    });
  });

  describe('Métropole Grand Lyon', () => {
    it("devrait être élligible pour les vélo d'occasion uniquement pour les vélos mécaniques avec un revenu fiscal de référence < 19 500 €/an", () => {
      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'pliant'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '15000€/an',
      });
      // Prix maximum de 150€
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'pliant'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '100€',
        'revenu fiscal de référence': '15000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(100);

      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'pliant'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '100€',
        'revenu fiscal de référence': '20000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '100€',
        'revenu fiscal de référence': '15000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(0);
    });

    it('devrait correctement prendre en compte les vélo adaptés pour les personnes en situation de handicap', () => {
      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'adapté'",
        'vélo . prix': '15000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(1000);

      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'adapté'",
        'vélo . prix': '15000€',
        'revenu fiscal de référence': '20000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(200);
    });

    it('devrait correctement prendre en compte les vélo cargo', () => {
      // Cargo mécanique
      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'cargo'",
        'vélo . prix': '2000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(800);

      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'cargo'",
        'vélo . prix': '2000€',
        'revenu fiscal de référence': '20000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(200);

      // Cargo électrique
      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'cargo électrique'",
        'vélo . prix': '15000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(1000);

      engine.setSituation({
        'localisation . epci': "'Métropole de Lyon'",
        'vélo . type': "'cargo électrique'",
        'vélo . prix': '15000€',
        'revenu fiscal de référence': '20000€/an',
      });
      expect(engine.evaluate('aides . lyon').nodeValue).toEqual(200);
    });
  });

  describe('Communauté de communes Saône Beaujolais', () => {
    it("devrait être élligible pour les vélo d'occasion", () => {
      engine.setSituation({
        'localisation . epci': "'CC Saône-Beaujolais'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . saône-beaujolais').nodeValue).toEqual(
        300,
      );

      engine.setSituation({
        'localisation . epci': "'CC Saône-Beaujolais'",
        'vélo . type': "'pliant'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . saône-beaujolais').nodeValue).toEqual(
        200,
      );
    });
  });

  describe('Communauté de communes du Pays Mornantais', () => {
    it("devrait correctement prendre en compte le plafond de l'Anah", () => {
      engine.setSituation({
        'localisation . epci': "'CC du Pays Mornantais (COPAMO)'",
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . pays mornantais').nodeValue).toEqual(400);

      engine.setSituation({
        'localisation . epci': "'CC du Pays Mornantais (COPAMO)'",
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '30000€/an',
      });
      expect(engine.evaluate('aides . pays mornantais').nodeValue).toEqual(250);
    });

    it("ne devrait pas être élligible pour les vélo d'occasion", () => {
      engine.setSituation({
        'localisation . epci': "'CC du Pays Mornantais (COPAMO)'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });

      expect(engine.evaluate('aides . pays mornantais').nodeValue).toEqual(
        null,
      );
    });
  });

  describe('Quimperlé Communauté', () => {
    it("devrait pas être élligible pour les VAE d'occasion d'une valeur supérieure à 2000€", () => {
      engine.setSituation({
        'localisation . epci': "'CA Quimperlé Communauté'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '3000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . quimperlé').nodeValue).toEqual(null);
    });

    it("devrait être élligible pour les vélo cargo électrique d'occasion jusqu'à 5000€", () => {
      engine.setSituation({
        'localisation . epci': "'CA Quimperlé Communauté'",
        'vélo . type': "'cargo électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '3000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . quimperlé').nodeValue).toEqual(150);
    });

    it("devrait être élligible pour les VAE neuf jusqu'à 3000€", () => {
      engine.setSituation({
        'localisation . epci': "'CA Quimperlé Communauté'",
        'vélo . type': "'électrique'",
        'vélo . prix': '3000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . quimperlé').nodeValue).toEqual(150);
    });
  });

  describe('Ville de Caen', () => {
    it("devrait correctement prendre en compte les jeunes de moins de 25 ans pour les vélos d'occasion", () => {
      engine.setSituation({
        'localisation . code insee': "'14118'",
        'vélo . type': "'mécanique simple'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'demandeur . âge': '20 an',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . caen jeune').nodeValue).toEqual(50);
      expect(engine.evaluate('aides . caen').nodeValue).toEqual(null);

      engine.setSituation({
        'localisation . code insee': "'14118'",
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'demandeur . âge': '20 an',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . caen jeune').nodeValue).toEqual(null);
      expect(engine.evaluate('aides . caen').nodeValue).toEqual(null);
    });

    it('devrait être élligible pour les personnes en situation de handicap sans condition de revenu', () => {
      engine.setSituation({
        'localisation . code insee': "'14118'",
        'vélo . type': "'adapté'",
        'revenu fiscal de référence': '20000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . caen jeune').nodeValue).toEqual(null);
      expect(engine.evaluate('aides . caen').nodeValue).toEqual(null);
      expect(engine.evaluate('aides . caen vélo adapté').nodeValue).toEqual(
        300,
      );

      // Pas nécessairement adapté
      engine.setSituation({
        'localisation . code insee': "'14118'",
        'vélo . type': "'motorisation'",
        'revenu fiscal de référence': '20000€/an',
        'demandeur . en situation de handicap': 'oui',
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . caen jeune').nodeValue).toEqual(null);
      expect(engine.evaluate('aides . caen').nodeValue).toEqual(null);
      expect(engine.evaluate('aides . caen vélo adapté').nodeValue).toEqual(
        300,
      );
    });

    it("l'aide de Caen la mer ne devrait pas être élligible pour les personnes mineures", () => {
      engine.setSituation({
        'localisation . epci': "'CU Caen la Mer'",
        'revenu fiscal de référence': '10000€/an',
        'demandeur . âge': '16 an',
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . caen la mer').nodeValue).toEqual(null);
    });
  });

  describe('Vienne et Gartempe Communauté de communes', () => {
    it('devrait être élligible pour les mineurs uniquement si iels possèdent un contrat', () => {
      engine.setSituation({
        'localisation . epci': "'CC Vienne et Gartempe'",
        'revenu fiscal de référence': '10000€/an',
        'demandeur . âge': '16 an',
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . vienne gartempe').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . epci': "'CC Vienne et Gartempe'",
        'revenu fiscal de référence': '10000€/an',
        'demandeur . âge': '16 an',
        // TODO: use generated types instead of the json
        // @ts-ignore
        "aides . vienne gartempe . titulaire d'un contrat d'alternance ou de stage":
          'oui',
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . vienne gartempe').nodeValue).toEqual(400);
    });
  });

  describe('Ville de Montval sur Loir', () => {
    it('devrait être élligible pour les vélo mécanique seulement pour les bénéficiaires du RSA', () => {
      engine.setSituation({
        'localisation . code insee': "'72071'",
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'mécanique simple'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . montval sur loir').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . code insee': "'72071'",
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'vélo . prix': '200€',
        'demandeur . bénéficiaire du RSA': 'oui',
      });
      expect(engine.evaluate('aides . montval sur loir').nodeValue).toEqual(
        100,
      );
    });
  });

  describe('Sète Agglopôle Méditerranée', () => {
    it('devrait correctement prendre en compte les différents bonus', () => {
      engine.setSituation({
        'localisation . epci': "'CA Sète Agglopôle Méditerranée'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
      });
      expect(engine.evaluate('aides . sète').nodeValue).toEqual(200);

      engine.setSituation({
        'localisation . epci': "'CA Sète Agglopôle Méditerranée'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
      });
      expect(engine.evaluate('aides . sète').nodeValue).toEqual(250);

      engine.setSituation({
        'localisation . epci': "'CA Sète Agglopôle Méditerranée'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
        // TODO: use generated types instead of the json
        // @ts-ignore
        'aides . sète . acheté dans un commerce local': 'oui',
      });
      expect(engine.evaluate('aides . sète').nodeValue).toEqual(300);
    });
  });

  describe('Grand Avignon', () => {
    it("le cumul de l'aide avec celles des communes ne devrait pas dépaser 200€", () => {
      engine.setSituation({
        'localisation . epci': "'CA du Grand Avignon (COGA)'",
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        // TODO: use generated types instead of the json
        // @ts-ignore
        'aides . commune': 150,
      });
      expect(engine.evaluate('aides . grand avignon').nodeValue).toEqual(50);

      engine.setSituation({
        'localisation . epci': "'CA du Grand Avignon (COGA)'",
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        // TODO: use generated types instead of the json
        // @ts-ignore
        'aides . commune': 250,
      });
      expect(engine.evaluate('aides . grand avignon').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . epci': "'CA du Grand Avignon (COGA)'",
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
      });
      expect(engine.evaluate('aides . grand avignon').nodeValue).toEqual(100);
    });
  });

  describe("Ville d'Avignon", () => {
    it('le montant minimum de subvention devrait être respectée', () => {
      engine.setSituation({
        'localisation . code insee': "'84007'",
        'vélo . type': "'électrique'",
        'vélo . prix': '1000€',
      });
      expect(engine.evaluate('aides . avignon').nodeValue).toEqual(50);

      engine.setSituation({
        'localisation . code insee': "'84007'",
        'vélo . type': "'électrique'",
        'vélo . prix': '10€',
      });
      expect(engine.evaluate('aides . avignon').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . code insee': "'84007'",
        'vélo . type': "'électrique'",
        'vélo . prix': '3000€',
      });
      expect(engine.evaluate('aides . avignon').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . code insee': "'84007'",
        'vélo . type': "'mécanique simple'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '200€',
      });
      expect(engine.evaluate('aides . avignon').nodeValue).toEqual(70);

      engine.setSituation({
        'localisation . code insee': "'84007'",
        'vélo . type': "'mécanique simple'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '10€',
      });
      expect(engine.evaluate('aides . avignon').nodeValue).toEqual(0);
    });
  });

  describe('Ville de La Motte Servolex', () => {
    it("devrait être élligible pour les vélo d'occasion uniquement pour les vélos électriques", () => {
      engine.setSituation({
        'localisation . code insee': "'73179'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'vélo . type': "'électrique'",
      });
      expect(engine.evaluate('aides . la motte servolex').nodeValue).toEqual(
        150,
      );

      engine.setSituation({
        'localisation . code insee': "'73179'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'vélo . type': "'cargo électrique'",
      });
      expect(engine.evaluate('aides . la motte servolex').nodeValue).toEqual(
        null,
      );

      engine.setSituation({
        'localisation . code insee': "'73179'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'vélo . type': "'mécanique simple'",
      });
      expect(engine.evaluate('aides . la motte servolex').nodeValue).toEqual(
        null,
      );

      engine.setSituation({
        'localisation . code insee': "'73179'",
        'vélo . neuf ou occasion': "'occasion'",
        'vélo . prix': '1000€',
        'vélo . type': "'pliant'",
      });
      expect(engine.evaluate('aides . la motte servolex').nodeValue).toEqual(
        null,
      );
    });
  });

  describe('Grand Annecy Agglomération', () => {
    it('devrait prendre en compte un bonus de 400€ pour les PMR', () => {
      engine.setSituation({
        'localisation . epci': "'CA du Grand Annecy'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
      });
      expect(engine.evaluate('aides . annecy').nodeValue).toEqual(400);

      engine.setSituation({
        'localisation . epci': "'CA du Grand Annecy'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'demandeur . en situation de handicap': 'oui',
      });
      expect(engine.evaluate('aides . annecy').nodeValue).toEqual(800);
    });

    it("devrait prendre en compte les vélos d'occasions", () => {
      engine.setSituation({
        'localisation . epci': "'CA du Grand Annecy'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'mécanique simple'",
      });
      expect(engine.evaluate('aides . annecy').nodeValue).toEqual(150);

      engine.setSituation({
        'localisation . epci': "'CA du Grand Annecy'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'mécanique simple'",
        'vélo . neuf ou occasion': "'occasion'",
      });
      expect(engine.evaluate('aides . annecy').nodeValue).toEqual(70);

      engine.setSituation({
        'localisation . epci': "'CA du Grand Annecy'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
      });
      expect(engine.evaluate('aides . annecy').nodeValue).toEqual(400);
    });
  });

  describe('Communauté de communes Cluses Arve & Montagnes', () => {
    it("devrait correctement prendre en compte le bonus 'vélo d'occasion'", () => {
      engine.setSituation({
        'localisation . epci': "'CC Cluses-Arve et Montagnes'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
      });
      expect(
        engine.evaluate('aides . cluses arve et montagnes').nodeValue,
      ).toEqual(300);

      engine.setSituation({
        'localisation . epci': "'CC Cluses-Arve et Montagnes'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        'vélo . neuf ou occasion': "'occasion'",
      });
      expect(
        engine.evaluate('aides . cluses arve et montagnes').nodeValue,
      ).toEqual(400);
    });

    it("devrait correctement prendre en compte le bonus 'participation employeur'", () => {
      engine.setSituation({
        'localisation . epci': "'CC Cluses-Arve et Montagnes'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
      });
      expect(
        engine.evaluate('aides . cluses arve et montagnes').nodeValue,
      ).toEqual(300);

      engine.setSituation({
        'localisation . epci': "'CC Cluses-Arve et Montagnes'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '10000€/an',
        'vélo . type': "'électrique'",
        // TODO: use generated types instead of the json
        // @ts-ignore
        'aides . cluses arve et montagnes . participation employeur': 500,
      });
      expect(
        engine.evaluate('aides . cluses arve et montagnes').nodeValue,
      ).toEqual(700);
    });
  });

  describe('Anjou Bleu Communauté', () => {
    it('devrait correctement prendre en compte le revenu fiscal de référence maximal', () => {
      engine.setSituation({
        'localisation . epci': "'CC Anjou Bleu Communauté'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '16000€/an',
        'vélo . type': "'électrique'",
      });
      expect(engine.evaluate('aides . anjou bleu').nodeValue).not.toEqual(null);

      engine.setSituation({
        'localisation . epci': "'CC Anjou Bleu Communauté'",
        'vélo . prix': '1000€',
        'revenu fiscal de référence': '16000€/an',
        'vélo . type': "'électrique'",
        'personnes dans le foyer fiscal': 2,
      });
      expect(engine.evaluate('aides . anjou bleu').nodeValue).toEqual(null);
    });
  });
});
