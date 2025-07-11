import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import _kyc_hisotry from './kyc_history_test.json';

describe('/utilisateurs - KYC misc test', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.EMAIL_ENABLED = 'false';
  });

  it.skip(`Verification du calcul des conditions 'Quel type de carburant utilise votre voiture ?'`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';
    TestUtil.token = '12345';
    process.env.CRON_API_KEY = '12345';
    TestUtil.token = '12345';

    const reponse_injectKYCs = await TestUtil.POST('/admin/load_kycs_from_cms');
    expect(reponse_injectKYCs.status).toEqual(201);

    await kycRepository.loadCache();

    await TestUtil.create(DB.utilisateur, { kyc: _kyc_hisotry as any });

    // THEN

    const db_user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    db_user.kyc_history.isKYCEligible(
      db_user.kyc_history.getQuestion(
        KYCID.KYC_transport_voiture_thermique_carburant,
      ),
    );
  });
});
