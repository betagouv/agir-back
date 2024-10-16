import { KYC } from '@prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { DB, TestUtil } from '../../TestUtil';

describe('BilanCarbone (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it(`POST /utlilisateurs/compute_bilan_carbone bilan carbon utilisteur sans aucune reponse NGC`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_bilan_carbone');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('utilisateur-id');

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });

    expect(stats.situation).toEqual({});
    expect(stats.total_g).toEqual(9048184);
    expect(stats.transport_g).toEqual(1958482);
    expect(stats.alimenation_g).toEqual(2328700);
  });
  it(`POST /utlilisateurs/compute_bilan_carbone bilan carbon utilisteur avec une reponse alimentationNGC`, async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_saison_frequence',
          id_cms: 21,
          question: `À quelle fréquence mangez-vous de saison ? `,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          categorie: Categorie.mission,
          points: 10,
          reponses: [
            { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
          ],
          reponses_possibles: [
            { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
            { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
            { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
          ],
          tags: [],
          universes: [],
          ngc_key: 'alimentation . de saison . consommation',
          image_url: '111',
          short_question: 'short',
          conditions: [],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC_saison_frequence',
      id_cms: 21,
      question: `À quelle fréquence mangez-vous de saison ? `,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      reponses: [
        { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
        { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
        { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
      ],
      tags: [],
      universes: [],
      ngc_key: 'alimentation . de saison . consommation',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      created_at: undefined,
      is_ngc: true,
      thematique: 'alimentation',
      updated_at: undefined,
    } as KYC);

    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_bilan_carbone');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('utilisateur-id');

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });

    expect(stats.situation).toEqual({
      'alimentation . de saison . consommation': '"souvent"',
    });
    expect(stats.total_g).toEqual(9011638);
    expect(stats.transport_g).toEqual(1958482);
    expect(stats.alimenation_g).toEqual(2292154);
  });
});
