import { generateFishUrlForCurrentMonth } from '../../../../src/domain/bibliotheque_services/poissonsDeSaisonUrlsGenerator';

describe('Fichier de tests concernant la génération des Urls pour les poissons de saisons', () => {
  it('janvier', () => {
    // GIVEN
    // WHEN
    const result = generateFishUrlForCurrentMonth(0);
    // THEN
    expect(result).toBe(
      'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/calendrier-de-saison/les-poissons-et-fruits-de-mer-de-janvier',
    );
  });
  it('mars', () => {
    // GIVEN
    // WHEN
    const result = generateFishUrlForCurrentMonth(2);
    // THEN
    expect(result).toBe(
      'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/calendrier-de-saison/les-poissons-et-fruits-de-mer-de-mars',
    );
  });
  it('avril', () => {
    // GIVEN
    // WHEN
    const result = generateFishUrlForCurrentMonth(3);
    // THEN
    expect(result).toBe(
      'https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/calendrier-de-saison/les-poissons-et-fruits-de-mer-d-avril',
    );
  });
});
