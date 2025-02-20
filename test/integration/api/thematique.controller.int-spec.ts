import { DB, TestUtil } from '../../TestUtil';
import { CodeMission } from '../../../src/domain/mission/codeMission';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Mission } from '.prisma/client';
import { ObjectifDefinition } from '../../../src/domain/mission/missionDefinition';
import { Categorie } from '../../../src/domain/contenu/categorie';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { MissionRepository } from '../../../src/infrastructure/repository/mission.repository';
import { MissionsUtilisateur_v1 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v1';

describe('Thematique (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const missionRepository = new MissionRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /thematiques - liste les 4 thematiques principales', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.getServer().get('/thematiques');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
  });
});
