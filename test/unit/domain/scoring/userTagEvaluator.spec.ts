import { ApplicativePonderationSetName } from '../../../../src/domain/scoring/ponderationApplicative';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import {
  Consommation,
  Onboarding,
  Repas,
} from '../../../../src/domain/utilisateur/onboarding/onboarding';
import {
  Chauffage,
  TypeLogement,
  Superficie,
  Logement,
} from '../../../../src/domain/utilisateur/logement';
import {
  Transport,
  TransportQuotidien,
} from '../../../../src/domain/utilisateur/transport';
import { OnboardingResult } from '../../../../src/domain/utilisateur/onboarding/onboardingResult';
import { UserTagEvaluator } from '../../../../src/domain/scoring/userTagEvaluator';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';

const ONBOARDING_DATA = {
  version: 0,
  transports: [TransportQuotidien.moto, TransportQuotidien.voiture],
  adultes: 1,
  avion: 0,
  chauffage: Chauffage.bois,
  code_postal: '91120',
  commune: 'Palaiseau',
  proprietaire: true,
  enfants: 1,
  consommation: Consommation.jamais,
  repas: Repas.vegan,
  residence: TypeLogement.appartement,
  superficie: Superficie.superficie_150,
};

function initNewUser(onboarding: Onboarding): Utilisateur {
  const user = new Utilisateur();
  user.onboardingData = onboarding;
  user.onboardingResult = OnboardingResult.buildFromOnboarding(onboarding);
  user.logement = Logement.buildFromOnboarding(onboarding);
  user.transport = Transport.buildFromOnboarding(onboarding);
  user.tag_ponderation_set = {};
  user.kyc_history = new KYCHistory();

  return user;
}

describe('UseragEvaluator', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
  });

  afterAll(async () => {
    process.env = OLD_ENV;
  });

  it('recomputeRecoTags : shoping adddict L 1', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({ ...ONBOARDING_DATA, consommation: Consommation.jamais }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.shopping_addict] = 0;
  });
  it('recomputeRecoTags : shoping adddict L 4', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({
        ...ONBOARDING_DATA,
        consommation: Consommation.shopping,
      }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.shopping_addict] = 60;
  });
  it('recomputeRecoTags : viande adddict L 1', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({
        ...ONBOARDING_DATA,
        repas: Repas.vegan,
      }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.viande_addict] = 0;
  });
  it('recomputeRecoTags : viande adddict L 4', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({
        ...ONBOARDING_DATA,
        repas: Repas.viande,
      }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.viande_addict] = 60;
  });
  it('recomputeRecoTags : viande adddict L 4', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({
        ...ONBOARDING_DATA,
        repas: Repas.viande,
      }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.viande_addict] = 60;
  });
  it('recomputeRecoTags : utilise_moto_ou_voiture : moto', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({
        ...ONBOARDING_DATA,
        transports: [TransportQuotidien.moto],
      }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.utilise_moto_ou_voiture] = 100;
  });
  it('recomputeRecoTags : utilise_moto_ou_voiture : voiture', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({
        ...ONBOARDING_DATA,
        transports: [TransportQuotidien.voiture],
      }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.utilise_moto_ou_voiture] = 100;
  });
  it('recomputeRecoTags : utilise_moto_ou_voiture : pied', () => {
    // GIVEN
    const user = initNewUser(
      new Onboarding({
        ...ONBOARDING_DATA,
        transports: [TransportQuotidien.pied],
      }),
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.utilise_moto_ou_voiture] = 0;
  });
  it('recomputeRecoTags : kyc_001 : tout à zero', () => {
    // GIVEN
    const user = initNewUser(new Onboarding({ ...ONBOARDING_DATA }));
    user.kyc_history.updateQuestion('001', []);

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.alimentation] = 0;
    user.tag_ponderation_set[Tag.dechet] = 0;
    user.tag_ponderation_set[Tag.climat] = 0;
    user.tag_ponderation_set[Tag.loisir] = 0;
    user.tag_ponderation_set[Tag.transport] = 0;
    user.tag_ponderation_set[Tag.consommation] = 0;
    user.tag_ponderation_set[Tag.logement] = 0;
  });
  it('recomputeRecoTags : kyc_001 : tout à 50', () => {
    // GIVEN
    const user = initNewUser(new Onboarding({ ...ONBOARDING_DATA }));
    user.kyc_history.updateQuestion('001', [
      '🥦 Alimentation',
      '☀️ Climat et Environnement',
      '🛒 Consommation durable',
      '🗑️ Déchets',
      '🏡 Logement',
      '⚽ Loisirs (vacances, sport,...)',
      '🚗 Transports',
    ]);

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.alimentation] = 50;
    user.tag_ponderation_set[Tag.dechet] = 50;
    user.tag_ponderation_set[Tag.climat] = 50;
    user.tag_ponderation_set[Tag.loisir] = 50;
    user.tag_ponderation_set[Tag.transport] = 50;
    user.tag_ponderation_set[Tag.consommation] = 50;
    user.tag_ponderation_set[Tag.logement] = 50;
  });
});
