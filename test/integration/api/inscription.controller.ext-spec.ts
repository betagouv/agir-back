import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import _situationNGCTest from './situationNGCtest.json';

describe('/utilisateurs - Inscription - (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.EMAIL_ENABLED = 'false';
  });

  async function importSitutationAndGetId(situation: object): Promise<string> {
    process.env.NGC_API_KEY = '12345';
    const response = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: situation,
      });

    expect(response.status).toEqual(201);

    let situtation_id = response.body.redirect_url.split('=')[1];
    situtation_id = situtation_id.substring(0, situtation_id.indexOf('&'));

    console.log(situtation_id);
    return situtation_id;
  }

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it(`POST /utilisateurs_v2 - test situtation "complete", avec pre import de toutes les KYC de puis le CMS => coche le mini bilan`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';
    TestUtil.token = '12345';
    process.env.CRON_API_KEY = '12345';
    TestUtil.token = '12345';

    const reponse_injectKYCs = await TestUtil.POST('/admin/load_kycs_from_cms');
    expect(reponse_injectKYCs.status).toEqual(201);
    console.log(reponse_injectKYCs.body);

    const situationId = await importSitutationAndGetId(_situationNGCTest);

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situationId,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com');

    expect(
      user.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_local_frequence)
        .getReponseUniqueSaisie(),
    ).toEqual('Souvent');
    expect(
      user.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_transport_voiture_km)
        .getReponseUniqueSaisie(),
    ).toEqual('12000');
    expect(
      user.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_transport_avion_3_annees)
        .getReponseUniqueSaisie(),
    ).toEqual('Oui');
    expect(
      user.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_superficie)
        .getReponseUniqueSaisie(),
    ).toEqual('130');
    expect(
      user.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_menage)
        .getReponseUniqueSaisie(),
    ).toEqual('4');
  });
});