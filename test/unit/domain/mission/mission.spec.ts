import { ContentType } from '../../../../src/domain/contenu/contentType';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { Mission } from '../../../../src/domain/mission/mission';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { Mission_v1 } from '../../../../src/domain/object_store/mission/MissionsUtilisateur_v1';
import { ThematiqueUnivers } from '../../../../src/domain/univers/thematiqueUnivers';
import {
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

describe('Missions', () => {
  it('validateDefi : valider un seul défi NE termine PAS la mission', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
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
    });

    // WHEN
    mission.validateDefiObjectif('2');

    // THEN
    expect(mission.objectifs[1].isDone()).toEqual(true);
    expect(mission.isDone()).toEqual(false);
  });
  it('validateDefi : terminaison de mission', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'mail@www.com',
      false,
      SourceInscription.inconnue,
    );
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
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
    });

    // WHEN
    const result = mission.terminer(utilisateur);

    // THEN
    expect(mission.isDone()).toEqual(true);
    expect(mission.done_at.getTime()).toBeGreaterThan(Date.now() - 100);
    expect(utilisateur.gamification.celebrations).toHaveLength(1);
  });
  it('getProgression : ok si mission vide', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      objectifs: [],
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
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
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
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
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 0,
      target: 4,
    });
  });
  it('getProgression : cap à 1 défi', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
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
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 0,
      target: 3,
    });
  });
  it('getProgression : current OK', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
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
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 2,
      target: 4,
    });
  });
  it('getProgression : all done + terminé', () => {
    // GIVEN
    const mission = new Mission({
      done_at: new Date(),
      est_visible: true,
      id: '123',
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,

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
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 4,
      target: 4,
    });
  });
  it('getProgression : current OK', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,

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
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 2,
      target: 4,
    });
  });
  it('getProgression : mission sans défis', () => {
    // GIVEN
    const mission = new Mission({
      done_at: null,
      est_visible: true,
      id: '123',
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,

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
    });

    // WHEN
    const result = mission.getProgression();

    // THEN
    expect(result).toEqual({
      current: 2,
      target: 4,
    });
  });
  it('isUniversDone : ok si tout done', () => {
    // GIVEN
    const m1: Mission_v1 = {
      done_at: new Date(),
      est_visible: true,
      id: '123',
      objectifs: [],
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
    };
    const m2: Mission_v1 = {
      done_at: new Date(),
      est_visible: true,
      id: '456',
      objectifs: [],
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
    };
    const m3: Mission_v1 = {
      done_at: new Date(),
      est_visible: true,
      id: '1',
      objectifs: [],
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.climat,
      titre: 'titre',
      is_first: false,
    };
    const m4: Mission_v1 = {
      done_at: null,
      est_visible: true,
      id: '2',
      objectifs: [],
      code: ThematiqueUnivers.cereales,
      image_url: 'image',
      thematique: Thematique.climat,
      titre: 'titre',
      is_first: false,
    };

    const missionsUtilisateur = new MissionsUtilisateur({
      version: 0,
      missions: [m1, m2, m3, m4],
    });
    // THEN
    expect(
      missionsUtilisateur.isThematiqueDone(Thematique.alimentation),
    ).toEqual(true);
    expect(missionsUtilisateur.isThematiqueDone(Thematique.climat)).toEqual(
      false,
    );
  });
});
