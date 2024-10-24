import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { KYCHistory_v0 } from '../../../../src/domain/object_store/kyc/kycHistory_v0';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../../src/domain/kyc/questionKYC';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { Univers } from '../../../../src/domain/univers/univers';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KYCMosaicID } from '../../../../src/domain/kyc/KYCMosaicID';

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
      version: 0,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'fafa',
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
          universes: [Univers.climat],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
          unite: Unite.euro,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const raw = KYCHistory_v0.serialise(domain_start);
    const domain_end = new KYCHistory(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYCHistory({
      version: 0,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'fafa',
            },
          ],
          reponses_possibles: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'fifi',
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              ngc_code: '456',
              value: 'fofo',
            },
            {
              label: 'Ce que je mange',
              code: Thematique.alimentation,
              ngc_code: '789',
              value: 'fefe',
            },
          ],
          tags: [Tag.consommation],
          universes: [Univers.climat],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
          unite: Unite.euro,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const raw = KYCHistory_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.KYCHistory);
    const domain_end = new KYCHistory(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
