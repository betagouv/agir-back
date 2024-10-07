import Engine from 'publicodes';
import rules from '../../../../src/infrastructure/data/aidesVelo.json';

const engine = new Engine(rules);

const baseSituation = {
  'localisation . code insee': "'75056'",
  'localisation . epci': "'Métropole du Grand Paris'",
  'localisation . région': "'11'",
};

describe('Aides Vélo', () => {
  describe('Bonus Vélo', () => {
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
        'vélo . type': "'électrique'",
        'vélo . prix': '500€',
        'personne en situation de handicap': 'oui',
      });
      const expectedAmount = Math.min(500 * 0.4, 400);

      expect(engine.evaluate('aides . bonus vélo').nodeValue).toEqual(
        expectedAmount,
      );
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
});
