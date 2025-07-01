import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { KYCMosaicID } from '../../../../src/domain/kyc/KYCMosaicID';
import { TypeReponseQuestionKYC } from '../../../../src/domain/kyc/questionKYC';
import { KYCHistory_v1 } from '../../../../src/domain/object_store/kyc/kycHistory_v1';
import { KYCHistory_v2 } from '../../../../src/domain/object_store/kyc/kycHistory_v2';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { Tag } from '../../../../src/domain/scoring/tag';
import { Thematique } from '../../../../src/domain/thematique/thematique';

describe('KYC vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.KYCHistory);

    // WHEN
    const domain = new KYCHistory(raw);

    // THEN
    expect(domain.getAnsweredKYCs()).toHaveLength(0);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYCHistory({
      version: 2,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: KYCID.KYC001,
          id_cms: 1,
          last_update: new Date(123),
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          is_skipped: true,
          categorie: Categorie.test,
          points: 10,
          reponse_simple: {
            unite: { abreviation: 'kg' },
            value: 'fafa',
          },
          reponse_complexe: [
            {
              code: 'code',
              ngc_code: 'ngc_code',
              label: 'label',
              value: '123',
              selected: true,
            },
          ],
          tags: [Tag.consommation],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          unite: { abreviation: 'euro' },
          emoji: '🔥',
          ngc_key: '87654',
          thematique: Thematique.consommation,
        },
      ],
    });

    // WHEN
    const raw = KYCHistory_v2.serialise(domain_start);
    const domain_end = new KYCHistory(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v2 OK', () => {
    // GIVEN
    const domain_start = new KYCHistory({
      version: 2,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: KYCID.KYC001,
          id_cms: 1,
          last_update: new Date(123),
          is_skipped: true,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponse_simple: {
            unite: { abreviation: 'kg' },
            value: 'fafa',
          },
          reponse_complexe: [
            {
              code: 'code',
              ngc_code: 'ngc_code',
              label: 'label',
              value: '123',
              selected: true,
            },
          ],
          tags: [Tag.consommation],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          unite: { abreviation: 'euro' },
          emoji: '🔥',
          ngc_key: '87654',
          thematique: Thematique.consommation,
        },
      ],
    });

    // WHEN
    const raw = KYCHistory_v2.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.KYCHistory);
    const domain_end = new KYCHistory(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });

  //######################################################################
  //############################# v0 => v1 ###############################
  //######################################################################

  it('upgrade v0  => v1 OK, entier', () => {
    // GIVEN
    const v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_logement_age',
          tags: [],
          type: 'entier',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          reponses: [
            {
              code: null,
              label: '70',
              ngc_code: null,
            },
          ],
          categorie: 'test',
          image_url: null,
          universes: [],
          conditions: [],
          thematique: Thematique.logement,
          short_question: null,
          reponses_possibles: [],
          //unite: undefined,
          //a_supprimer: undefined,
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory, 1);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_logement_age',
          tags: [],
          type: 'entier',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          categorie: 'test',
          image_url: null,
          conditions: [],
          thematique: 'logement',
          a_supprimer: undefined,
          reponse_simple: {
            value: '70',
            unite: undefined,
          },
          short_question: null,
          reponse_complexe: null,
          unite: undefined,
        },
      ],
    });
  });

  it('upgrade v0  => v1 OK, decimal : missing value', () => {
    // GIVEN
    const v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_logement_age',
          tags: [],
          type: 'decimal',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          reponses: [],
          categorie: 'test',
          image_url: null,
          universes: [],
          conditions: [],
          thematique: Thematique.logement,
          short_question: null,
          reponses_possibles: [],
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory, 1);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_logement_age',
          tags: [],
          type: 'decimal',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          categorie: 'test',
          image_url: null,
          conditions: [],
          thematique: 'logement',
          a_supprimer: undefined,
          reponse_simple: {
            value: undefined,
            unite: undefined,
          },
          short_question: null,
          reponse_complexe: null,
          unite: undefined,
        },
      ],
    });
  });

  it('upgrade v0  => v1 OK, decimal', () => {
    // GIVEN
    const v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_logement_age',
          tags: [],
          type: 'decimal',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          reponses: [
            {
              code: null,
              label: '70.8',
              ngc_code: null,
            },
          ],
          categorie: 'test',
          image_url: null,
          universes: [],
          conditions: [],
          thematique: Thematique.logement,
          short_question: null,
          reponses_possibles: [],
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory, 1);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_logement_age',
          tags: [],
          type: 'decimal',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          categorie: 'test',
          image_url: null,
          conditions: [],
          thematique: 'logement',
          a_supprimer: undefined,
          reponse_simple: {
            value: '70.8',
            unite: undefined,
          },
          short_question: null,
          reponse_complexe: null,
          unite: undefined,
        },
      ],
    });
  });

  it('upgrade v0  => v1 OK, text libre', () => {
    // GIVEN
    const v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_logement_age',
          tags: [],
          type: 'libre',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          reponses: [
            {
              code: null,
              label: 'hello comment ça va ?',
              ngc_code: null,
            },
          ],
          categorie: 'test',
          image_url: null,
          universes: [],
          conditions: [],
          thematique: Thematique.logement,
          short_question: null,
          reponses_possibles: [],
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory, 1);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_logement_age',
          tags: [],
          type: 'libre',
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          categorie: 'test',
          image_url: null,
          conditions: [],
          thematique: 'logement',
          a_supprimer: undefined,
          reponse_simple: {
            value: 'hello comment ça va ?',
            unite: undefined,
          },
          short_question: null,
          reponse_complexe: null,
          unite: undefined,
        },
      ],
    });
  });

  it('upgrade v0  => v1 OK, choix unique', () => {
    // GIVEN
    const v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_bilan',
          tags: [],
          type: 'choix_unique',
          emoji: null,
          id_cms: 52,
          is_NGC: false,
          points: 5,
          ngc_key: null,
          question: 'Avez-vous déjà réalisé votre bilan environnemental ?',
          reponses: [
            {
              code: 'oui',
              label: 'Oui',
              ngc_code: null,
            },
          ],
          categorie: 'mission',
          image_url: null,
          universes: [],
          conditions: [],
          thematique: 'climat',
          short_question: null,
          reponses_possibles: [
            {
              code: 'oui',
              label: 'Oui',
              ngc_code: null,
            },
            {
              code: 'non',
              label: 'Non',
              ngc_code: null,
            },
            {
              code: 'ne_sait_pas',
              label: "Je ne sais pas ce que c'est",
              ngc_code: null,
            },
          ],
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory, 1);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_bilan',
          tags: [],
          type: 'choix_unique',
          emoji: null,
          id_cms: 52,
          is_NGC: false,
          points: 5,
          ngc_key: null,
          question: 'Avez-vous déjà réalisé votre bilan environnemental ?',
          categorie: 'mission',
          image_url: null,
          conditions: [],
          thematique: 'climat',
          a_supprimer: undefined,
          reponse_simple: null,
          short_question: null,
          unite: undefined,
          reponse_complexe: [
            {
              code: 'oui',
              label: 'Oui',
              ngc_code: null,
              value: 'oui',
            },
            {
              code: 'non',
              label: 'Non',
              ngc_code: null,
              value: 'non',
            },
            {
              code: 'ne_sait_pas',
              label: "Je ne sais pas ce que c'est",
              ngc_code: null,
              value: 'non',
            },
          ],
        },
      ],
    });
  });

  it('upgrade v0  => v1 OK, choix multiple', () => {
    // GIVEN
    const v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_preference',
          tags: [],
          type: 'choix_multiple',
          emoji: null,
          id_cms: 57,
          is_NGC: false,
          points: 0,
          ngc_key: null,
          question:
            'Sur quels thèmes recherchez-vous en priorité des aides et conseils ?',
          reponses: [
            {
              code: 'alimentation',
              label: 'La cuisine et l’alimentation',
              ngc_code: null,
            },
            {
              code: 'transport',
              label: 'Mes déplacements',
              ngc_code: null,
            },
          ],
          categorie: 'recommandation',
          image_url: null,
          universes: [],
          conditions: [],
          thematique: 'climat',
          short_question: null,
          reponses_possibles: [
            {
              code: 'alimentation',
              label: 'La cuisine et l’alimentation',
              ngc_code: null,
            },
            {
              code: 'transport',
              label: 'Mes déplacements',
              ngc_code: null,
            },
            {
              code: 'logement',
              label: 'Mon logement',
              ngc_code: null,
            },
            {
              code: 'consommation',
              label: 'Ma consommation',
              ngc_code: null,
            },
            {
              code: 'ne_sais_pas',
              label: 'Je ne sais pas encore',
              ngc_code: null,
            },
          ],
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory, 1);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_preference',
          tags: [],
          type: 'choix_multiple',
          emoji: null,
          id_cms: 57,
          is_NGC: false,
          points: 0,
          ngc_key: null,
          question:
            'Sur quels thèmes recherchez-vous en priorité des aides et conseils ?',
          categorie: 'recommandation',
          image_url: null,
          conditions: [],
          thematique: 'climat',
          a_supprimer: undefined,
          reponse_simple: null,
          short_question: null,
          unite: undefined,
          reponse_complexe: [
            {
              code: 'alimentation',
              label: 'La cuisine et l’alimentation',
              ngc_code: null,
              value: 'oui',
            },
            {
              code: 'transport',
              label: 'Mes déplacements',
              ngc_code: null,
              value: 'oui',
            },
            {
              code: 'logement',
              label: 'Mon logement',
              ngc_code: null,
              value: 'non',
            },
            {
              code: 'consommation',
              label: 'Ma consommation',
              ngc_code: null,
              value: 'non',
            },
            {
              code: 'ne_sais_pas',
              label: 'Je ne sais pas encore',
              ngc_code: null,
              value: 'non',
            },
          ],
        },
      ],
    });
  });

  //######################################################################
  //############################# v1 => v2 ###############################
  //######################################################################

  it('upgrade v1  => v2 OK, entier', () => {
    // GIVEN
    const v1: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_logement_age',
          tags: [],
          type: TypeReponseQuestionKYC.entier,
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          categorie: Categorie.mission,
          image_url: null,
          conditions: [],
          thematique: Thematique.logement,
          a_supprimer: undefined,
          reponse_simple: {
            value: '70',
            unite: undefined,
          },
          short_question: null,
          reponse_complexe: null,
          unite: undefined,
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v1, SerialisableDomain.KYCHistory);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_logement_age',
          tags: [],
          last_update: undefined,
          type: TypeReponseQuestionKYC.entier,
          emoji: null,
          id_cms: 191,
          is_NGC: true,
          is_skipped: false,
          points: 5,
          ngc_key: 'logement . âge',
          question: "Quel est l'âge de votre logement",
          categorie: Categorie.mission,
          image_url: null,
          conditions: [],
          thematique: Thematique.logement,
          a_supprimer: undefined,
          reponse_simple: {
            value: '70',
            unite: undefined,
          },
          short_question: null,
          reponse_complexe: null,
          unite: undefined,
        },
      ],
    });
  });

  it('upgrade v1  => v2 OK, choix unique', () => {
    // GIVEN
    const v1: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_bilan',
          tags: [],
          type: TypeReponseQuestionKYC.choix_unique,
          emoji: null,
          id_cms: 52,
          is_NGC: false,
          points: 5,
          ngc_key: null,
          question: 'Avez-vous déjà réalisé votre bilan environnemental ?',
          categorie: Categorie.mission,
          image_url: null,
          conditions: [],
          thematique: Thematique.climat,
          a_supprimer: undefined,
          reponse_simple: null,
          short_question: null,
          unite: undefined,
          reponse_complexe: [
            {
              code: 'oui',
              label: 'Oui',
              ngc_code: null,
              value: 'oui',
            },
            {
              code: 'non',
              label: 'Non',
              ngc_code: null,
              value: 'non',
            },
            {
              code: 'ne_sait_pas',
              label: "Je ne sais pas ce que c'est",
              ngc_code: null,
              value: 'non',
            },
          ],
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v1, SerialisableDomain.KYCHistory);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_bilan',
          tags: [],
          last_update: undefined,
          type: 'choix_unique',
          emoji: null,
          id_cms: 52,
          is_NGC: false,
          points: 5,
          is_skipped: false,
          ngc_key: null,
          question: 'Avez-vous déjà réalisé votre bilan environnemental ?',
          categorie: 'mission',
          image_url: null,
          conditions: [],
          thematique: 'climat',
          a_supprimer: undefined,
          reponse_simple: null,
          short_question: null,
          unite: undefined,
          reponse_complexe: [
            {
              code: 'oui',
              label: 'Oui',
              ngc_code: null,
              selected: true,
            },
            {
              code: 'non',
              label: 'Non',
              ngc_code: null,
              selected: false,
            },
            {
              code: 'ne_sait_pas',
              label: "Je ne sais pas ce que c'est",
              ngc_code: null,
              selected: false,
            },
          ],
        },
      ],
    });
  });

  it('upgrade v1  => v2 OK, choix multiple', () => {
    // GIVEN
    const v1: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [KYCMosaicID.MOSAIC_APPAREIL_NUM],
      answered_questions: [
        {
          code: 'KYC_preference',
          tags: [],
          type: TypeReponseQuestionKYC.choix_multiple,
          emoji: null,
          id_cms: 57,
          is_NGC: false,
          points: 0,
          ngc_key: null,
          question:
            'Sur quels thèmes recherchez-vous en priorité des aides et conseils ?',
          categorie: Categorie.recommandation,
          image_url: null,
          conditions: [],
          thematique: Thematique.climat,
          a_supprimer: undefined,
          reponse_simple: null,
          short_question: null,
          unite: undefined,
          reponse_complexe: [
            {
              code: 'alimentation',
              label: 'La cuisine et l’alimentation',
              ngc_code: null,
              value: 'oui',
            },
            {
              code: 'transport',
              label: 'Mes déplacements',
              ngc_code: null,
              value: 'oui',
            },
            {
              code: 'logement',
              label: 'Mon logement',
              ngc_code: null,
              value: 'non',
            },
            {
              code: 'consommation',
              label: 'Ma consommation',
              ngc_code: null,
              value: 'non',
            },
            {
              code: 'ne_sais_pas',
              label: 'Je ne sais pas encore',
              ngc_code: null,
              value: 'non',
            },
          ],
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v1, SerialisableDomain.KYCHistory);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 2,
      answered_mosaics: [KYCMosaicID.MOSAIC_APPAREIL_NUM],
      answered_questions: [
        {
          code: 'KYC_preference',
          tags: [],
          type: 'choix_multiple',
          emoji: null,
          id_cms: 57,
          is_NGC: false,
          points: 0,
          ngc_key: null,
          is_skipped: false,
          last_update: undefined,
          question:
            'Sur quels thèmes recherchez-vous en priorité des aides et conseils ?',
          categorie: 'recommandation',
          image_url: null,
          conditions: [],
          thematique: 'climat',
          a_supprimer: undefined,
          reponse_simple: null,
          short_question: null,
          unite: undefined,
          reponse_complexe: [
            {
              code: 'alimentation',
              label: 'La cuisine et l’alimentation',
              ngc_code: null,
              selected: true,
            },
            {
              code: 'transport',
              label: 'Mes déplacements',
              ngc_code: null,
              selected: true,
            },
            {
              code: 'logement',
              label: 'Mon logement',
              ngc_code: null,
              selected: false,
            },
            {
              code: 'consommation',
              label: 'Ma consommation',
              ngc_code: null,
              selected: false,
            },
            {
              code: 'ne_sais_pas',
              label: 'Je ne sais pas encore',
              ngc_code: null,
              selected: false,
            },
          ],
        },
      ],
    });
  });
});
