import { Categorie } from '../../../src/domain/contenu/categorie';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../src/domain/kyc/questionKYC';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { StatistiqueExternalRepository } from '../../../src/infrastructure/repository/statitstique.external.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DuplicateUsecase } from '../../../src/usecase/stats/new/duplicate.usecase';
import { DB, TestUtil } from '../../TestUtil';

const KYC_DATA: QuestionKYC_v2 = {
  code: '1',
  last_update: undefined,
  id_cms: 11,
  question: `question`,
  type: TypeReponseQuestionKYC.choix_unique,
  is_NGC: false,
  a_supprimer: false,
  categorie: Categorie.test,
  points: 10,
  reponse_complexe: undefined,
  reponse_simple: undefined,
  tags: [],
  thematique: Thematique.consommation,
  ngc_key: '123',
  short_question: 'short',
  image_url: 'AAA',
  conditions: [],
  unite: Unite.kg,
  emoji: '🔥',
};

describe('Duplicate Usecase', () => {
  let statistiqueExternalRepository = new StatistiqueExternalRepository(
    TestUtil.prisma_stats,
  );
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  let duplicateUsecase = new DuplicateUsecase(
    utilisateurRepository,
    statistiqueExternalRepository,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('duplicateUtilisateur : copy ok si moins de user que block size', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      external_stat_id: '123',
      code_commune: '456',
      derniere_activite: new Date(1),
    });

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(5);

    // THEN
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(stats_users).toHaveLength(1);

    const user = stats_users[0];
    expect(user.nombre_parts_fiscales.toNumber()).toEqual(2);
    delete user.nombre_parts_fiscales;

    expect(user).toEqual({
      code_insee_commune: '456',
      code_postal: '91120',
      compte_actif: true,
      date_derniere_activite: new Date(1),
      id: '123',
      nom_commune: 'PALAISEAU',
      nombre_points: 10,
      revenu_fiscal: 10000,
      source_inscription: 'web',
    });
  });

  it(`duplicateUtilisateur : copy ok si plus d'utilisateuts que block size`, async () => {
    // GIVEN
    for (let index = 0; index < 10; index++) {
      await TestUtil.create(DB.utilisateur, {
        id: 'id_' + index,
        external_stat_id: 'stat_id_' + index,
        code_commune: '456',
        email: 'email_' + index,
      });
    }

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(7);

    // THEN
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(stats_users).toHaveLength(10);
  });
  it(`duplicateUtilisateur : genere un id externe si nécessaire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      external_stat_id: null,
    });

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(5);

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findMany();
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(userDB[0].external_stat_id).not.toBeNull();
    expect(userDB[0].external_stat_id.length).toBeGreaterThan(20);
    expect(stats_users[0].id).toEqual(userDB[0].external_stat_id);
  });

  it('duplicateKYC : copy ok 1 KYC de type choix unique', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.choix_unique,
          last_update: new Date(1),
          thematique: Thematique.alimentation,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              selected: true,
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: false,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.code_kyc).toEqual('1');
    expect(kycDB.cms_id).toEqual('10');
    expect(kycDB.question).toEqual('question');
    expect(kycDB.thematique).toEqual(Thematique.alimentation);
    expect(kycDB.type_question).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(kycDB.derniere_mise_a_jour).toEqual(new Date(1));
    expect(kycDB.reponse_unique_code).toEqual('climat');
  });

  it('duplicateKYC : copy ok 1 KYC de type choix multiple', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.choix_multiple,
          last_update: new Date(1),
          thematique: Thematique.alimentation,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              selected: true,
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: false,
            },
            {
              label: 'Mon logement',
              code: 'toto',
              selected: true,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_multiple_code).toEqual(['climat', 'toto']);
  });

  it('duplicateKYC : copy ok 1 KYC de type entier', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.entier,
          last_update: new Date(1),
          thematique: Thematique.alimentation,
          reponse_simple: {
            value: '12',
          },
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_entier).toEqual(12);
  });
  it('duplicateKYC : copy ok 1 KYC de type decimal', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.decimal,
          last_update: new Date(1),
          thematique: Thematique.alimentation,
          reponse_simple: {
            value: '12.3',
          },
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_decimal).toEqual('12.3');
  });
  it('duplicateKYC : copy ok 1 KYC de type texte', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.libre,
          last_update: new Date(1),
          thematique: Thematique.alimentation,
          reponse_simple: {
            value: 'hello',
          },
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_texte).toEqual('hello');
  });
});
