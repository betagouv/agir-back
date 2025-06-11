import { KYCHistory } from '../../src/domain/kyc/kycHistory';
import { KycToTags_v2 } from '../../src/domain/kyc/synchro/kycToTagsV2';
import { Logement } from '../../src/domain/logement/logement';
import { ProfileRecommandationUtilisateur } from '../../src/domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../src/domain/scoring/system_v2/Tag_v2';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { TestUtil } from '../TestUtil';

describe('KycToTags_v2', () => {
  const communeRepository = new CommuneRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it(`refreshTagState : aucune data, pas d'erreur`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      profile,
      logement,
      communeRepository,
    );

    // WHEN
    translator.refreshTagState();

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([]);
  });
  it(`refreshTagState : Gère correctement le tag urbain`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      profile,
      logement,
      communeRepository,
    );

    logement.code_commune = '21231';

    // WHEN
    translator.refreshTagState();

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([Tag_v2.habite_zone_urbaine]);
  });
  it(`refreshTagState : Gère correctement le tag rural`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      profile,
      logement,
      communeRepository,
    );

    logement.code_commune = '97126';

    // WHEN
    translator.refreshTagState();

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([Tag_v2.habite_zone_rurale]);
  });
  it(`refreshTagState : Gère correctement le tag peri urbain`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      profile,
      logement,
      communeRepository,
    );

    logement.code_commune = '97132';

    // WHEN
    translator.refreshTagState();

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_peri_urbaine,
    ]);
  });
});
