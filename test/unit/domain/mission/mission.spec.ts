import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { ContentType } from '../../../../src/domain/contenu/contentType';
import { Mission } from '../../../../src/domain/mission/mission';
import { CelebrationType } from '../../../../src/domain/gamification/celebrations/celebration';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';

describe('Missions', () => {
  it('validateDefi : valider un seul défi termine la mission', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'C',
      'George',
      'mail@www.com',
      12345,
      '91120',
      'PALAISEAU',
    );
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [
        {
          content_id: '1',
          id: '1',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.article,
        },
        {
          content_id: '2',
          id: '2',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
        {
          content_id: '3',
          id: '3',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
      ],
      prochaines_thematiques: ['aaa'],
      thematique_univers: 'cereales',
    });

    // WHEN
    const result = mission.validateDefi('2', utilisateur);

    // THEN
    expect(mission.objectifs[1].isDone()).toEqual(true);
    expect(mission.isDone()).toEqual(true);
    expect(result).toEqual(['aaa']);
    expect(utilisateur.gamification.celebrations).toHaveLength(1);
    expect(utilisateur.gamification.celebrations[0].type).toEqual(
      CelebrationType.fin_thematique,
    );
  });
  it('getProgression : ok si mission vide', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      objectifs: [],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
      univers: 'alimentation',
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 0,
      target: 0,
    });
  });
  it('getProgression : ok si 1 kyc, 1 aricle, 1 defi', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [
        {
          content_id: '1',
          id: '1',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.kyc,
        },
        {
          content_id: '2',
          id: '2',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.article,
        },
        {
          content_id: '3',
          id: '3',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
      ],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 0,
      target: 3,
    });
  });
  it('getProgression : cap à 1 défi', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [
        {
          content_id: '1',
          id: '1',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.kyc,
        },
        {
          content_id: '2',
          id: '2',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
        {
          content_id: '3',
          id: '3',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
      ],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 0,
      target: 2,
    });
  });
  it('getProgression : current OK', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [
        {
          content_id: '1',
          id: '1',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.kyc,
        },
        {
          content_id: '2',
          id: '2',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.article,
        },
        {
          content_id: '3',
          id: '3',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
        {
          content_id: '4',
          id: '4',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
      ],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 2,
      target: 3,
    });
  });
  it('getProgression : all done', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [
        {
          content_id: '1',
          id: '1',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.kyc,
        },
        {
          content_id: '2',
          id: '2',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.article,
        },
        {
          content_id: '3',
          id: '3',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
        {
          content_id: '4',
          id: '4',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
      ],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 3,
      target: 3,
    });
  });
  it('getProgression : current OK', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [
        {
          content_id: '1',
          id: '1',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.kyc,
        },
        {
          content_id: '2',
          id: '2',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.article,
        },
        {
          content_id: '3',
          id: '3',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
        {
          content_id: '4',
          id: '4',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.defi,
        },
      ],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 2,
      target: 3,
    });
  });
  it('getProgression : mission sans défis', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [
        {
          content_id: '1',
          id: '1',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.kyc,
        },
        {
          content_id: '2',
          id: '2',
          done_at: new Date(),
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.article,
        },
        {
          content_id: '3',
          id: '3',
          done_at: null,
          est_reco: false,
          is_locked: false,
          sont_points_en_poche: false,
          points: 5,
          titre: 'yo',
          type: ContentType.quizz,
        },
      ],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 2,
      target: 3,
    });
  });
  it('isUniversDone : ok si tout done', () => {
    // GIVEN
    const m1 = new Mission({
      done_at: new Date(),
      est_visible: true,
      id: '123',
      univers: 'alimentation',
      objectifs: [],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });
    const m2 = new Mission({
      done_at: new Date(),
      est_visible: true,
      id: '456',
      univers: 'alimentation',
      objectifs: [],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });
    const m3 = new Mission({
      done_at: new Date(),
      est_visible: true,
      id: '1',
      univers: 'climat',
      objectifs: [],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });
    const m4 = new Mission({
      done_at: null,
      est_visible: true,
      id: '2',
      univers: 'climat',
      objectifs: [],
      prochaines_thematiques: [],
      thematique_univers: 'cereales',
    });

    const missionsUtilisateur = new MissionsUtilisateur({
      version: 0,
      missions: [m1, m2, m3, m4],
    });
    // THEN
    expect(missionsUtilisateur.isUniversDone('alimentation')).toEqual(true);
    expect(missionsUtilisateur.isUniversDone('climat')).toEqual(false);
    expect(missionsUtilisateur.isUniversDone('anything')).toEqual(false);
  });
});
