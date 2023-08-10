import { TestUtil } from '../../TestUtil';
import {UtilisateurRepository} from '../../../src/infrastructure/repository/utilisateur.repository';

describe('UtilisateurRepository', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('Creates a new utilisateur without ID', async () => {
    await utilisateurRepository.createUtilisateurByName("bob");
    const utilisateurs = await TestUtil.prisma.utilisateur.findMany({});
    expect(utilisateurs).toHaveLength(1);
    expect(utilisateurs[0].id).toHaveLength(36);
  });

});
