import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import {
  AideVeloAPI,
  AidesVeloParTypeAPI,
} from '../../../src/infrastructure/api/types/aide/AidesVeloParTypeAPI';
import { DB, TestUtil } from '../../TestUtil';

describe('Aide Velo (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sous plafond OK, tranche 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      revenu_fiscal: 5000,
      parts: 1 as any,
    });
    process.env.MINIATURES_URL = 'http://localhost:3000';

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 5000,
    });

    const bonusVelo: AideVeloAPI = {
      libelle: 'Bonus vélo',
      montant: 150,
      plafond: 150,
      description:
        "Le bonus vélo est maintenu pour toute facture émise avant le 14 février 2025 (inclus). Vous avez jusqu'au 14 août 2025 pour faire votre demande. Passé ce délai, il ne sera plus possible de bénéficier du bonus.",
      lien: 'https://www.economie.gouv.fr/particuliers/prime-velo-electrique#',
      collectivite: {
        kind: 'pays',
        value: 'France',
      },
      logo: 'http://localhost:3000/logo_etat_francais.webp',
    };

    const idfMobilites: AideVeloAPI = {
      libelle: 'Île-de-France Mobilités',
      montant: 50,
      plafond: 50,
      description:
        "Aide financière pour l'achat de vélos à assistance électrique, de vélos mécanique (pour les moins de 25 ans) et de vélos adaptés. Neuf ou d'occasion.",
      lien: 'https://www.iledefrance-mobilites.fr/le-reseau/services-de-mobilite/velo/prime-achat-velo',
      collectivite: {
        kind: 'région',
        value: '11',
      },
      logo: 'http://localhost:3000/logo_ile_de_france.webp',
    };

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual<AidesVeloParTypeAPI>({
      'mécanique simple': [bonusVelo],
      électrique: [
        {
          ...bonusVelo,
          montant: 400,
          plafond: 400,
        },
        {
          ...idfMobilites,
          montant: 400,
          plafond: 400,
        },
      ],
      cargo: [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          montant: 400,
          plafond: 400,
        },
      ],
      'cargo électrique': [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          montant: 600,
          plafond: 600,
        },
      ],
      pliant: [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },

        {
          ...idfMobilites,
          montant: 400,
          plafond: 400,
        },
      ],
      'pliant électrique': [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          montant: 400,
          plafond: 400,
        },
      ],
      motorisation: [
        {
          ...idfMobilites,
          montant: 200,
          plafond: 200,
        },
      ],
      adapté: [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          montant: 1200,
          plafond: 1200,
        },
      ],
    });
  });

  it('POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sur plafond OK, tranche 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      revenu_fiscal: 5000,
      parts: 1 as any,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['électrique'][0].libelle).toEqual('Bonus vélo');
    expect(response.body['électrique'][0].montant).toEqual(400);
  });
  it('POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sur plafond OK, tranche 2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      revenu_fiscal: 10000,
      parts: 1 as any,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['électrique'][0].libelle).toEqual('Bonus vélo');
    expect(response.body['électrique'][0].montant).toEqual(300);
  });

  it(`POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sur plafond OK, au dela tranche 2, pas d'aide sauf si situation de handicap`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      revenu_fiscal: 20000,
      parts: 1 as any,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['électrique']).toHaveLength(1);
    expect(response.body['électrique'][0].libelle).toEqual(
      'Île-de-France Mobilités',
    );

    // WHEN
    const response2 = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100000,
      situation_handicap: true,
    });

    // THEN
    expect(response2.status).toBe(201);
    expect(response2.body['électrique']).toHaveLength(2);
    expect(response2.body['électrique'][0].libelle).toEqual('Bonus vélo');
    expect(response2.body['électrique'][1].libelle).toEqual(
      'Île-de-France Mobilités',
    );
  });

  it(`POST /utilisateurs/:utilisateurId/simulerAideVelo à Montpellier, aide à l'achat d'un vélo éléctrique uniquement pour vélo d'occasion`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      revenu_fiscal: 10000,
      parts: 1 as any,
      logement: {
        version: 0,
        superficie: Superficie.superficie_150,
        type: TypeLogement.maison,
        code_postal: '34000',
        chauffage: Chauffage.bois,
        commune: 'MONTPELLIER',
        dpe: DPE.B,
        nombre_adultes: 2,
        nombre_enfants: 2,
        plus_de_15_ans: true,
        proprietaire: true,
        code_commune: '34172',
      },
    });

    // WHEN
    const response_neuf = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 1000,
      etat_du_velo: 'neuf',
    });

    // THEN
    expect(response_neuf.status).toBe(201);
    expect(
      response_neuf.body['électrique'].find(
        (a) => a.libelle === 'Montpellier Méditerranée Métropole',
      ),
    ).toBeUndefined();

    // WHEN
    const response_occasion = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 1000,
      etat_du_velo: 'occasion',
    });

    // THEN
    expect(response_occasion.status).toBe(201);
    expect(
      response_occasion.body['électrique'].find(
        (a) => a.libelle === 'Montpellier Méditerranée Métropole',
      ),
    ).toBeDefined();
  });

  it(`POST /aides/simulerAideVelo OK avec un code commune`, async () => {
    // GIVEN
    process.env.MINIATURES_URL = 'http://localhost:3000';

    // WHEN
    const response = await TestUtil.POST('/aides/simulerAideVelo').send({
      code_insee: '21231',
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['cargo électrique']).toEqual([
      {
        collectivite: {
          kind: 'département',
          value: '21',
        },
        description: `Une subvention de 250 € par VAE acheté dans un commerce de Côte-d'Or (pas sur internet). Une bonification de 100 € est accordée pour toute acquisition de VAE assemblé ou produit en Côte-d'Or, soit une aide totale de 350 €.

Dispositif valable jusqu'au 31 décembre 2024.`,
        libelle: "Département Côte-d'Or",
        lien: 'https://www.cotedor.fr/aide/acquisition-de-velo-assistance-electrique',
        logo: 'http://localhost:3000/logo_cd21.webp',
        montant: 250,
        plafond: 250,
      },
    ]);
  });

  it(`POST /aides/simulerAideVelo OK avec un code métropole`, async () => {
    // GIVEN
    process.env.MINIATURES_URL = 'http://localhost:3000';

    // WHEN
    const response = await TestUtil.POST('/aides/simulerAideVelo').send({
      code_insee: '242100410',
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['cargo électrique']).toEqual([
      {
        collectivite: {
          kind: 'département',
          value: '21',
        },
        description: `Une subvention de 250 € par VAE acheté dans un commerce de Côte-d'Or (pas sur internet). Une bonification de 100 € est accordée pour toute acquisition de VAE assemblé ou produit en Côte-d'Or, soit une aide totale de 350 €.

Dispositif valable jusqu'au 31 décembre 2024.`,
        libelle: "Département Côte-d'Or",
        lien: 'https://www.cotedor.fr/aide/acquisition-de-velo-assistance-electrique',
        logo: 'http://localhost:3000/logo_cd21.webp',
        montant: 250,
        plafond: 250,
      },
    ]);
  });

  describe('POST /aides/recupererAideVeloParCodeCommuneOuEPCI', () => {
    test('OK avec un code INSEE (Ville de Merignac)', async () => {
      // WHEN
      const response = await TestUtil.POST(
        '/aides/recupererAideVeloParCodeCommuneOuEPCI',
      ).send({
        code_insee_ou_siren: '33281',
      });

      // EXPECT
      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].collectivite).toEqual({
        kind: 'pays',
        value: 'France',
      });
      expect(response.body[1].collectivite).toEqual({
        kind: 'epci',
        code: '243300316',
        value: 'Bordeaux Métropole',
      });
      expect(response.body[2].collectivite).toEqual({
        kind: 'code insee',
        value: '33281',
      });
    });

    test('OK avec un code SIREN (Bordeaux Métropole)', async () => {
      // WHEN
      const response = await TestUtil.POST(
        '/aides/recupererAideVeloParCodeCommuneOuEPCI',
      ).send({
        code_insee_ou_siren: '243300316',
      });

      // EXPECT
      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].collectivite).toEqual({
        kind: 'pays',
        value: 'France',
      });
      expect(response.body[1].collectivite).toEqual({
        kind: 'epci',
        code: '243300316',
        value: 'Bordeaux Métropole',
      });
    });

    test('OK avec récupération des aides régionales et départementales (Montpellier)', async () => {
      // WHEN
      const response = await TestUtil.POST(
        '/aides/recupererAideVeloParCodeCommuneOuEPCI',
      ).send({
        code_insee_ou_siren: '34172',
      });

      // EXPECT
      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(7);
      expect(response.body[0].libelle).toBe('Bonus vélo');
      expect(response.body[1].libelle).toContain('Région Occitanie');
      expect(response.body[1].description).toContain(
        "Achat d'un vélo à assistance électrique",
      );
      expect(response.body[2].libelle).toContain('Région Occitanie');
      expect(response.body[2].description).toContain('Bonus vélo adapté PMR');
      expect(response.body[3].libelle).toContain('Département Hérault');
      expect(response.body[4].libelle).toContain('Département Hérault');
      expect(response.body[4].description).toContain(
        'Chèque Hérault Handi-Vélo',
      );
      expect(response.body[5].libelle).toContain(
        'Montpellier Méditerranée Métropole',
      );
      expect(response.body[5].description).toContain(
        "vélo électrique ou d'occasion",
      );
      expect(response.body[6].libelle).toContain(
        'Montpellier Méditerranée Métropole',
      );
      expect(response.body[6].description).toContain(
        'personnes en situation de handicap',
      );
    });
  });
});
