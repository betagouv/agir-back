import Engine from 'publicodes';
import rules from '../../../../src/infrastructure/data/aidesVelo.json';

describe('Aides Vélo', () => {
  const engine = new Engine(rules);

  describe('Bonus Vélo', () => {
    const baseSituation = {
      'localisation . code insee': "'75056'",
      'localisation . epci': "'Métropole du Grand Paris'",
      'localisation . région': "'11'",
    };

    it('ne doit pas être accordé pour un revenu fiscal de référence > 15 400 €/an', () => {
      // Set base situation
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
        'vélo . type': "'électrique'",
      });

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(null);
    });

    it('doit être accordée pour les personnes en situation de handicap quelque soit le revenu fiscal de référence', () => {
      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '2500€',
      });

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(1000);

      engine.setSituation({
        ...baseSituation,
        'revenu fiscal de référence': '20000€/an',
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
        'vélo . type': "'adapté'",
        'vélo . prix': '1000€',
      });

      expect(engine.evaluate('aides . occitanie').nodeValue).toEqual(null);
      expect(
        engine.evaluate('aides . occitanie vélo adapté').nodeValue,
      ).toEqual(500);

      engine.setSituation({
        'localisation . région': "'76'",
        'revenu fiscal de référence': '8000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . occitanie').nodeValue).toEqual(null);
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

      expect(engine.evaluate('aides . paris').nodeValue).toEqual(null);
      expect(engine.evaluate('aides . paris vélo adapté').nodeValue).toEqual(
        275,
      );

      engine.setSituation({
        'localisation . code insee': "'75056'",
        'revenu fiscal de référence': '5000€/an',
        'vélo . type': "'adapté'",
        'vélo . prix': '25000€',
      });
      expect(engine.evaluate('aides . paris').nodeValue).toEqual(null);
      expect(engine.evaluate('aides . paris vélo adapté').nodeValue).toEqual(
        900,
      );
    });
  });

  describe('Département Hérault', () => {
    it('devrait correctement prendre en compte les vélo adaptés pour les personnes en situation de handicap', () => {
      engine.setSituation({
        'localisation . département': "'34'",
        'revenu fiscal de référence': '10000€/an',
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
        'statut étudiant': 'oui',
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
        'statut étudiant': 'oui',
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
        'personne en situation de handicap': 'oui',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(
        400,
      );

      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'adapté'",
        'vélo . prix': '10000€',
        'revenu fiscal de référence': '20000€/an',
        'personne en situation de handicap': 'oui',
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
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(0);

      engine.setSituation({
        'localisation . epci': "'CA de Sophia Antipolis'",
        'vélo . type': "'pliant'",
        'vélo . prix': '300€',
        'revenu fiscal de référence': '15000€/an',
      });
      expect(engine.evaluate('aides . sophia antipolis').nodeValue).toEqual(0);
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
});
