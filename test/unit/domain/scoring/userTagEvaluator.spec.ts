import { ApplicativePonderationSetName } from '../../../../src/domain/scoring/ponderationApplicative';
import { UserTagEvaluator } from '../../../../src/domain/scoring/userTagEvaluator';
import { Tag } from '../../../../src/domain/scoring/tag';
import { TypeReponseQuestionKYC } from '../../../../src/domain/kyc/questionKYC';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { Univers } from '../../../../src/domain/univers/univers';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KycDefinition } from '../../../../src/domain/kyc/kycDefinition';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';

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

  it('recomputeRecoTags : kyc_001 : tout à zero', () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur('a@a.com', false, null);
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
        conditions: [],
      }),
    ]);
    user.kyc_history.updateQuestionByCodeWithLabelOrException(KYCID.KYC001, []);

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
    const user = Utilisateur.createNewUtilisateur('a@a.com', false, null);
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
        conditions: [],
      }),
    ]);
    user.kyc_history.updateQuestionByCodeWithLabelOrException(KYCID.KYC001, [
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
    const user = Utilisateur.createNewUtilisateur('a@a.com', false, null);
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
        conditions: [],
      }),
    ]);
    user.kyc_history.updateQuestionByCodeWithLabelOrException(
      KYCID.KYC_preference,
      [
        'La cuisine et l’alimentation',
        'Mes déplacements',
        'Ma consommation',
        'Mon logement',
      ],
    );

    // WHEN
    UserTagEvaluator.recomputeRecoTags(user);

    // THEN
    user.tag_ponderation_set[Tag.alimentation] = 50;
    user.tag_ponderation_set[Tag.transport] = 50;
    user.tag_ponderation_set[Tag.consommation] = 50;
    user.tag_ponderation_set[Tag.logement] = 50;
  });
});
