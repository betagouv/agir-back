import { ApplicativePonderationSetName } from '../../../../src/domain/scoring/ponderationApplicative';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import {
  Consommation,
  Onboarding,
  Repas,
} from '../../../../src/domain/onboarding/onboarding';
import {
  Chauffage,
  TypeLogement,
  Superficie,
  Logement,
} from '../../../../src/domain/logement/logement';
import {
  Transport,
  TransportQuotidien,
} from '../../../../src/domain/transport/transport';
import { OnboardingResult } from '../../../../src/domain/onboarding/onboardingResult';
import { UserTagEvaluator } from '../../../../src/domain/scoring/userTagEvaluator';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { TypeReponseQuestionKYC } from '../../../../src/domain/kyc/questionKYC';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { Univers } from '../../../../src/domain/univers/univers';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KycDefinition } from '../../../../src/domain/kyc/kycDefinition';

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
    user.kyc_history.setCatalogue([]);

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
    user.kyc_history.setCatalogue([]);

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
    user.kyc_history.setCatalogue([]);

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
    user.kyc_history.setCatalogue([]);

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
    user.kyc_history.setCatalogue([]);

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
    user.kyc_history.setCatalogue([]);

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
    user.kyc_history.setCatalogue([]);

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
    user.kyc_history.setCatalogue([]);

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.utilise_moto_ou_voiture] = 0;
  });
  it('recomputeRecoTags : kyc_001 : tout à zero', () => {
    // GIVEN
    const user = initNewUser(new Onboarding({ ...ONBOARDING_DATA }));
    user.kyc_history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        ngc_key: 'a . b . c',
        reponses: [
          { label: '🥦 Alimentation', code: Thematique.alimentation },
          { label: '☀️ Climat et Environnement', code: Thematique.climat },
          { label: '🛒 Consommation durable', code: Thematique.consommation },
          { label: '🗑️ Déchets', code: Thematique.dechet },
          { label: '🏡 Logement', code: Thematique.logement },
          {
            label: '⚽ Loisirs (vacances, sport,...)',
            code: Thematique.loisir,
          },
          { label: '🚗 Transports', code: Thematique.transport },
          { label: 'Aucun / Je ne sais pas', code: 'rien' },
        ],
        short_question: 'short',
        image_url: 'AAA',
      }),
    ]);
    user.kyc_history.updateQuestionByCodeWithLabel(KYCID.KYC001, []);

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
    user.kyc_history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: '🥦 Alimentation', code: Thematique.alimentation },
          { label: '☀️ Climat et Environnement', code: Thematique.climat },
          { label: '🛒 Consommation durable', code: Thematique.consommation },
          { label: '🗑️ Déchets', code: Thematique.dechet },
          { label: '🏡 Logement', code: Thematique.logement },
          {
            label: '⚽ Loisirs (vacances, sport,...)',
            code: Thematique.loisir,
          },
          { label: '🚗 Transports', code: Thematique.transport },
          { label: 'Aucun / Je ne sais pas', code: 'rien' },
        ],
        short_question: 'short',
        image_url: 'AAA',
      }),
    ]);
    user.kyc_history.updateQuestionByCodeWithLabel(KYCID.KYC001, [
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

  it('recomputeRecoTags : KYC_preference : tout à 50', () => {
    // GIVEN
    const user = initNewUser(new Onboarding({ ...ONBOARDING_DATA }));
    user.kyc_history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_preference,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          {
            code: 'alimentation',
            label: 'La cuisine et l’alimentation',
            ngc_code: null,
          },
          { code: 'transport', label: 'Mes déplacements', ngc_code: null },
          { code: 'logement', label: 'Mon logement', ngc_code: null },
          { code: 'consommation', label: 'Ma consommation', ngc_code: null },
          {
            code: 'ne_sais_pas',
            label: 'Je ne sais pas encore',
            ngc_code: null,
          },
        ],
        short_question: 'short',
        image_url: 'AAA',
      }),
    ]);
    user.kyc_history.updateQuestionByCodeWithLabel(KYCID.KYC_preference, [
      'La cuisine et l’alimentation',
      'Mes déplacements',
      'Ma consommation',
      'Mon logement',
    ]);

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.alimentation] = 50;
    user.tag_ponderation_set[Tag.transport] = 50;
    user.tag_ponderation_set[Tag.consommation] = 50;
    user.tag_ponderation_set[Tag.logement] = 50;
  });
});
