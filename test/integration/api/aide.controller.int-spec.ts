import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { AideAPI } from '../../../src/infrastructure/api/types/aide/AideAPI';
import { DB, TestUtil } from '../../TestUtil';
import { Besoin } from '../../../src/domain/aides/besoin';

describe('Aide (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /utilisateurs/:utilisateurId/simulerAideVelo ok', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 1000,
    });

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.cargo[0].libelle).toEqual('Bonus vélo');
  });
  it('GET /utilisateurs/:utilisateurId/aides', async () => {
    // GIVEN
    await thematiqueRepository.upsertThematique(2, 'Climat !!');
    await thematiqueRepository.upsertThematique(5, 'Logement !!');
    await thematiqueRepository.loadThematiques();
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide);

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/aides');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);

    const aideBody = response.body[0] as AideAPI;
    expect(aideBody.content_id).toEqual('1');
    expect(aideBody.codes_postaux).toEqual(['91120']);
    expect(aideBody.contenu).toEqual("Contenu de l'aide");
    expect(aideBody.is_simulateur).toEqual(true);
    expect(aideBody.montant_max).toEqual(999);
    expect(aideBody.thematiques).toEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
    expect(aideBody.thematiques_label).toEqual(['Climat !!', 'Logement !!']);
    expect(aideBody.titre).toEqual('titreA');
    expect(aideBody.url_simulateur).toEqual('/aides/velo');
    expect(aideBody.besoin).toEqual(Besoin.acheter_velo);
    expect(aideBody.besoin_desc).toEqual('Acheter un vélo');
  });
  it('GET /utilisateurs/:utilisateurId/aides filtre par code postal', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      logement: { code_postal: '22222' },
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['11111'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['22222'],
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/aides');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);

    const aideBody = response.body[0] as AideAPI;
    expect(aideBody.content_id).toEqual('2');
  });
});
