import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { QuestionChoixUnique } from '../../../../src/domain/kyc/new_interfaces/QuestionChoixUnique';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../src/domain/kyc/questionKYC';
import { Logement } from '../../../../src/domain/logement/logement';
import { KYCHistory_v2 } from '../../../../src/domain/object_store/kyc/kycHistory_v2';
import { Tag } from '../../../../src/domain/scoring/tag';
import { Thematique } from '../../../../src/domain/thematique/thematique';
import {
  GlobalUserVersion,
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

const KYC = {
  code: KYCID.KYC007,
  id_cms: 7,
  question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
  type: TypeReponseQuestionKYC.choix_unique,
  is_NGC: false,
  a_supprimer: false,
  categorie: Categorie.mission,
  points: 5,
  tags: [],
  reponse_complexe: [
    { label: 'Café', code: 'cafe', ngc_code: undefined, selected: true },
    {
      label: 'Thé ou tisane',
      code: 'the',
      ngc_code: undefined,
      selected: false,
    },
    {
      label: 'Chicoré',
      code: 'chicore',
      ngc_code: undefined,
      selected: false,
    },
  ],
  thematiques: [],
  short_question: 'short',
  image_url: 'https://',
  conditions: [],
  unite: { abreviation: 'euro' },
  emoji: '🔥',
  reponse_simple: undefined,
  thematique: Thematique.alimentation,
};

const kyc: KYCHistory_v2 = {
  version: 2,
  answered_mosaics: [],
  answered_questions: [
    {
      ...KYC,
      id_cms: 1,
      code: KYCID.KYC_preference,
      question: `Quel est votre sujet principal d'intéret ?`,
      type: TypeReponseQuestionKYC.choix_multiple,
      is_NGC: false,
      categorie: Categorie.test,
      last_update: new Date(),
      points: 10,
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
          label: 'Ce que je mange',
          code: Thematique.alimentation,
          selected: false,
        },
        {
          label: 'Comment je bouge',
          code: Thematique.transport,
          selected: false,
        },
      ],
      tags: [],
    },
  ],
};

describe('Objet Utilisateur', () => {
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur reel si presente', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = 3;
    utilisateur.logement = new Logement();
    utilisateur.logement.nombre_adultes = 3;
    utilisateur.logement.nombre_enfants = 3;

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(3);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur adulte + enfants si parts null', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.logement = new Logement();
    utilisateur.logement.nombre_adultes = 3;
    utilisateur.logement.nombre_enfants = 3;

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(6);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur adulte + 0.5 x enfants si parts null', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.logement = new Logement();
    utilisateur.logement.nombre_adultes = 3;
    utilisateur.logement.nombre_enfants = 2;

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(4);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie 1 si tout null et absent', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.logement = new Logement();

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(1);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie adultes seul', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.logement = new Logement();
    utilisateur.logement.nombre_adultes = 5;
    utilisateur.logement.nombre_enfants = null;

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(5);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie enfants seul', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.logement = new Logement();
    utilisateur.logement.nombre_adultes = null;
    utilisateur.logement.nombre_enfants = 4;

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(4);
  });
  it('setTagSwitchOrZero : match ok', () => {
    // GIVEN
    const user = new Utilisateur();
    user.tag_ponderation_set = {};

    const kyc = new QuestionKYC({
      code: KYCID.KYC007,
      last_update: undefined,
      id_cms: 7,
      question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      a_supprimer: false,
      categorie: Categorie.mission,
      points: 5,
      tags: [],
      reponse_complexe: [
        {
          label: 'Café',
          code: 'cafe',
          ngc_code: undefined,
          selected: true,
        },
        {
          label: 'Thé ou tisane',
          code: 'the',
          ngc_code: undefined,
          selected: false,
        },
        {
          label: 'Chicoré',
          code: 'chicore',
          ngc_code: undefined,
          selected: false,
        },
      ],
      short_question: 'short',
      image_url: 'https://',
      conditions: [],
      unite: { abreviation: 'euro' },
      emoji: '🔥',
      reponse_simple: undefined,
      thematique: Thematique.alimentation,
    });

    // WHEN
    user.increaseTagForAnswers(Tag.climat, new QuestionChoixUnique(kyc), {
      cafe: 100,
      the: 50,
      chicore: 10,
    });

    // THEN
    expect(user.tag_ponderation_set.climat).toEqual(100);
  });
  it('setTagSwitchOrZero : match nothing', () => {
    // GIVEN
    const user = new Utilisateur();
    user.tag_ponderation_set = { climat: 5 };

    const kyc = new QuestionKYC({
      ...KYC,
      id_cms: 7,
      last_update: undefined,
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      a_supprimer: false,
      reponse_complexe: [
        {
          label: 'autre',
          code: 'autre',
          ngc_code: undefined,
          selected: true,
        },
        {
          label: 'Café',
          code: 'cafe',
          ngc_code: undefined,
          selected: false,
        },
        {
          label: 'Thé ou tisane',
          code: 'the',
          ngc_code: undefined,
          selected: false,
        },
        {
          label: 'Chicoré',
          code: 'chicore',
          ngc_code: undefined,
          selected: false,
        },
      ],
    });

    // WHEN
    user.increaseTagForAnswers(Tag.climat, new QuestionChoixUnique(kyc), {
      cafe: 100,
      the: 50,
      chicore: 10,
    });

    // THEN
    expect(user.tag_ponderation_set.climat).toEqual(5);
  });
  it('increaseTagForAnswers : cumule', () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'w@w.com',
      false,
      SourceInscription.inconnue,
    );
    user.tag_ponderation_set = {};

    const kyc = new QuestionKYC({
      ...KYC,
      code: KYCID.KYC007,
      id_cms: 7,
      last_update: undefined,
      question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      reponse_complexe: [
        {
          label: 'Thé ou tisane',
          code: 'the',
          ngc_code: undefined,
          selected: true,
        },
        {
          label: 'CHI',
          code: 'chicore',
          ngc_code: undefined,
          selected: true,
        },
        {
          label: 'Café',
          code: 'cafe',
          ngc_code: undefined,
          selected: false,
        },
        {
          label: 'autre',
          code: 'autre',
          ngc_code: undefined,
          selected: false,
        },
      ],
    });

    // WHEN
    user.increaseTagForAnswers(Tag.climat, new QuestionChoixUnique(kyc), {
      cafe: 100,
      the: 50,
      chicore: 10,
    });

    // THEN
    expect(user.tag_ponderation_set.climat).toEqual(60);
  });

  it('isOnboardingDone : nouvel utilisateur createNewUtilisateur', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(false);
  });
  it('isOnboardingDone : user v1 onboarding done avec pseudo', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = 'yoyo';
    utilisateur.logement.code_postal = '21000';
    utilisateur.global_user_version = GlobalUserVersion.V1;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(true);
  });
  it('isOnboardingDone : user v1 onboarding manque KYC', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.pseudo = 'yoyo';
    utilisateur.logement.code_postal = '21000';
    utilisateur.global_user_version = GlobalUserVersion.V1;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(false);
  });
  it('isOnboardingDone : user v1 onboarding done avec prenom', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = null;
    utilisateur.prenom = 'haha';
    utilisateur.logement.code_postal = '21000';
    utilisateur.global_user_version = GlobalUserVersion.V1;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(true);
  });
  it('isOnboardingDone : user v1 pseudo manquant', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = null;
    utilisateur.logement.code_postal = '21000';
    utilisateur.global_user_version = GlobalUserVersion.V1;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(false);
  });
  it('isOnboardingDone : user v1 code postal manquant', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = 'yoyo';
    utilisateur.logement.code_postal = null;
    utilisateur.global_user_version = GlobalUserVersion.V1;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(false);
  });
  it('isOnboardingDone : user v1 code postal pas complet', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = 'yoyo';
    utilisateur.logement.code_postal = '12';
    utilisateur.global_user_version = GlobalUserVersion.V1;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(false);
  });

  it('isOnboardingDone : user v1 onboarding done avec pseudo, date naissance manquante en V2', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = 'yoyo';
    utilisateur.logement.code_postal = '21000';
    utilisateur.global_user_version = GlobalUserVersion.V2;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(false);
  });
  it('isOnboardingDone : user v1 onboarding done avec pseudo, date naissance OK en  V2', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = 'yoyo';
    utilisateur.logement.code_postal = '21000';
    utilisateur.annee_naissance = 1978;
    utilisateur.mois_naissance = 6;
    utilisateur.jour_naissance = 19;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(true);
  });
  it('isOnboardingDone : user v1 onboarding done avec pseudo, date naissance incomplete en  V2', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.kyc_history = new KYCHistory(kyc);
    utilisateur.pseudo = 'yoyo';
    utilisateur.logement.code_postal = '21000';
    utilisateur.annee_naissance = 1978;
    utilisateur.mois_naissance = null;
    utilisateur.jour_naissance = 19;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    // THEN
    expect(utilisateur.isOnboardingDone()).toEqual(false);
  });
  it('getDateNaissanceString : reverse parse OK date FC', () => {
    // GIVEN
    let utilisateur = Utilisateur.createNewUtilisateur(
      'A',
      false,
      SourceInscription.web,
    );

    utilisateur.annee_naissance = 1978;
    utilisateur.mois_naissance = 6;
    utilisateur.jour_naissance = 19;

    // THEN
    expect(utilisateur.getDateNaissanceString()).toEqual('1978-06-19');
  });
});
