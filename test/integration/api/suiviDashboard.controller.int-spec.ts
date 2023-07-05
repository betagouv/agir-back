import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/suivi_dashboard (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/suivi_dashboard - get empty dashboard when nothing in DB', async () => {
    await TestUtil.create('utilisateur');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivi_dashboard',
    );
    expect(response.status).toBe(200);
  });
  it('GET /utilisateurs/id/suivi_dashboard - get dashboard with proper last suivi date', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('suivi', {
      id: '1',
      attributs: ['total_impact'],
      valeurs: ['10'],
      created_at: TestUtil.getDate('2023-01-01'),
    });
    await TestUtil.create('suivi', {
      id: '2',
      attributs: ['total_impact'],
      valeurs: ['20'],
      created_at: TestUtil.getDate('2023-01-01'),
    });
    await TestUtil.create('suivi', {
      id: '3',
      created_at: TestUtil.getDate('2023-01-15'),
      attributs: ['total_impact'],
      valeurs: ['50'],
    });
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivi_dashboard',
    );
    expect(response.status).toBe(200);
    expect(Date.parse(response.body.date_dernier_suivi)).toEqual(
      Date.parse('2023-01-15'),
    );
    expect(response.body.impact_dernier_suivi).toEqual(50);
  });
  it('GET /utilisateurs/id/suivi_dashboard - get dashboard with proper merged last suivi date', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('suivi', {
      id: '1',
      created_at: TestUtil.getDate('2023-01-15'),
      type: 'alimentation',
      attributs: ['total_impact', 'viande_rouge'],
      valeurs: ['10', '12'],
    });
    await TestUtil.create('suivi', {
      id: '2',
      created_at: TestUtil.getDate('2023-01-30'),
      type: 'transport',
      attributs: ['total_impact', 'km_voiture'],
      valeurs: ['20', '10'],
    });
    await TestUtil.create('suivi', {
      id: '3',
      created_at: TestUtil.getDate('2023-01-30'),
      type: 'alimentation',
      attributs: ['total_impact', 'viande_blanche'],
      valeurs: ['50', '36'],
    });
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivi_dashboard',
    );
    expect(response.status).toBe(200);
    expect(Date.parse(response.body.date_dernier_suivi)).toEqual(
      Date.parse('2023-01-30'),
    );
    expect(response.body.impact_dernier_suivi).toEqual(70);
    expect(response.body.variation).toEqual(60);
    expect(response.body.dernier_suivi.km_voiture).toEqual(10);
    expect(response.body.dernier_suivi.viande_blanche).toEqual(36);
    expect(response.body.moyenne).toEqual(40);
    expect(response.body.derniers_totaux[0].valeur).toEqual(10);
    expect(Date.parse(response.body.derniers_totaux[0].date)).toEqual(
      Date.parse('2023-01-15'),
    );
    expect(response.body.derniers_totaux[1].valeur).toEqual(70);
    expect(Date.parse(response.body.derniers_totaux[1].date)).toEqual(
      Date.parse('2023-01-30'),
    );
  });
});
