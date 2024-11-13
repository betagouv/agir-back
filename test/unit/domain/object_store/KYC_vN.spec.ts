import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../../src/domain/kyc/questionKYC';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KYCMosaicID } from '../../../../src/domain/kyc/KYCMosaicID';
import { KYCHistory_v1 } from '../../../../src/domain/object_store/kyc/kycHistory_v1';
import { KYCHistory_v0 } from '../../../../src/domain/object_store/kyc/kycHistory_v0';

describe('KYC vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.KYCHistory);

    // WHEN
    const domain = new KYCHistory(raw);

    // THEN
    expect(domain.answered_questions).toHaveLength(0);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYCHistory({
      version: 1,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponse_simple: {
            unite: Unite.kg,
            value: 'fafa',
          },
          reponse_complexe: [
            {
              code: 'code',
              ngc_code: 'ngc_code',
              label: 'label',
              value: '123',
            },
          ],
          tags: [Tag.consommation],
          thematiques: [Thematique.climat],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          unite: Unite.euro,
          emoji: '🔥',
          ngc_key: '87654',
          thematique: Thematique.consommation,
        },
      ],
    });

    // WHEN
    const raw = KYCHistory_v1.serialise(domain_start);
    const domain_end = new KYCHistory(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYCHistory({
      version: 1,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponse_simple: {
            unite: Unite.kg,
            value: 'fafa',
          },
          reponse_complexe: [
            {
              code: 'code',
              ngc_code: 'ngc_code',
              label: 'label',
              value: '123',
            },
          ],
          tags: [Tag.consommation],
          thematiques: [Thematique.climat],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          unite: Unite.euro,
          emoji: '🔥',
          ngc_key: '87654',
          thematique: Thematique.consommation,
        },
      ],
    });

    // WHEN
    const raw = KYCHistory_v1.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.KYCHistory);
    const domain_end = new KYCHistory(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });

  it('upgrade v0  => v1 OK, choix multiples', () => {
    // GIVEN
    const v0: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: true,
          categorie: Categorie.test,
          points: 10,
          ngc_key: '234567',
          thematique: Thematique.alimentation,
          reponses: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'fafa',
            },
            {
              label: 'Ce que je mange',
              code: Thematique.alimentation,
              ngc_code: '789',
              value: 'fefe',
            },
          ],
          reponses_possibles: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'fafa',
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              ngc_code: '456',
              value: 'fifi',
            },
            {
              label: 'Ce que je mange',
              code: Thematique.alimentation,
              ngc_code: '789',
              value: 'fefe',
            },
          ],
          tags: [Tag.consommation],
          universes: [Thematique.climat, Thematique.dechet],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          unite: Unite.euro,
          emoji: '🔥',
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: 'KYC001',
          id_cms: 1,
          categorie: 'test',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          emoji: '🔥',
          image_url: 'AAA',
          is_NGC: false,
          ngc_key: '234567',
          points: 10,
          question: "Quel est votre sujet principal d'intéret ?",
          short_question: 'short',
          tags: ['consommation'],
          thematique: 'alimentation',
          thematiques: ['climat', 'dechet'],
          type: 'choix_multiple',
          a_supprimer: true,
          unite: 'euro',
          reponse_simple: null,
          reponse_complexe: [
            {
              code: 'climat',
              label: 'Le climat',
              ngc_code: '123',
              value: 'fafa',
            },
            {
              code: 'alimentation',
              label: 'Ce que je mange',
              ngc_code: '789',
              value: 'fefe',
            },
          ],
        },
      ],
    });
  });

  it('upgrade v0  => v1 OK, entier', () => {
    // GIVEN
    const v0: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: false,
          a_supprimer: true,
          categorie: Categorie.test,
          points: 10,
          ngc_key: '234567',
          thematique: Thematique.alimentation,
          reponses: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: '567',
            },
          ],
          reponses_possibles: undefined,
          tags: [Tag.consommation],
          universes: [Thematique.climat, Thematique.dechet],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          unite: Unite.euro,
          emoji: '🔥',
        },
      ],
    };

    // WHEN
    const upgraded = Upgrader.upgradeRaw(v0, SerialisableDomain.KYCHistory);

    // THEN
    expect(upgraded).toStrictEqual({
      version: 1,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: 'KYC001',
          id_cms: 1,
          categorie: 'test',
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          emoji: '🔥',
          image_url: 'AAA',
          is_NGC: false,
          ngc_key: '234567',
          points: 10,
          question: "Quel est votre sujet principal d'intéret ?",
          short_question: 'short',
          tags: ['consommation'],
          thematique: 'alimentation',
          thematiques: ['climat', 'dechet'],
          type: 'entier',
          a_supprimer: true,
          unite: 'euro',
          reponse_simple: {
            value: '567',
            unite: 'euro',
          },
          reponse_complexe: null,
        },
      ],
    });
  });
});
