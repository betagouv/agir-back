import { TestUtil } from '../../TestUtil';

describe('/bilan (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateur/id/bilans/last - get last bilan by id user', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '1', name: 'bob' },
    });

    await TestUtil.prisma.situationNGC.create({
      data: {
        id: 'situationID',
        situation: `{ "transport . voiture . propriétaire": "'false'","transport . voiture . gabarit": "'SUV'","transport . voiture . motorisation": "'thermique'",   "alimentation . boisson . chaude . café . nombre": 4,   "transport . voiture . thermique . carburant": "'essence E85'" }`,
      },
    });

    await TestUtil.prisma.empreinte.create({
      data: {
        id: 'empreinteID',
        utilisateurId: '1',
        situationId: 'situationID',
        bilan: {
          details: {
            divers: 852,
            logement: 1424,
            transport: 1854,
            alimentation: 2014,
            services_societaux: 1553,
          },
          bilan_carbone_annuel: 7700,
        },
      },
    });

    const response = await TestUtil.getServer().get(
      '/utilisateur/1/bilans/last',
    );
    expect(response.status).toBe(200);
    // cette valeur est amenée à évoluer avec le modéle publicode co2
    expect(response.body.bilan_carbone_annuel).toBe(7700);
  });
});
