import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import {
  Consommation,
  Onboarding,
  Repas,
} from '../../../../src/domain/onboarding/onboarding';
import { Onboarding_v0 } from '../../../../src/domain/object_store/Onboarding/onboarding_v0';
import {
  Chauffage,
  TypeLogement,
  Superficie,
} from '../../../../src/domain/logement/logement';
import { TransportQuotidien } from '../../../../src/domain/transport/transport';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../src/domain/kyc/questionQYC';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';

const ONBOARDING_DATA: Onboarding_v0 = {
  version: 0,
  transports: [TransportQuotidien.moto, TransportQuotidien.voiture],
  adultes: 1,
  avion: 0,
  chauffage: Chauffage.bois,
  code_postal: '91120',
  commune: 'Palaiseau',
  proprietaire: true,
  enfants: 1,
  consommation: Consommation.jamais,
  repas: Repas.vegan,
  residence: TypeLogement.appartement,
  superficie: Superficie.superficie_150,
};

describe('Objet Utilisateur', () => {
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur reel si presente', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = 3;

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(3);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur adulte + enfants si parts null', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.onboardingData = new Onboarding({
      ...ONBOARDING_DATA,
      adultes: 3,
      enfants: 3,
    });

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(6);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur adulte + 0.5 x enfants si parts null', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.onboardingData = new Onboarding({
      ...ONBOARDING_DATA,
      adultes: 3,
      enfants: 2,
    });

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(4);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie 1 si tout null et absent', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.onboardingData = new Onboarding({
      ...ONBOARDING_DATA,
      adultes: null,
      enfants: null,
    });

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(1);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie adultes seul', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.onboardingData = new Onboarding({
      ...ONBOARDING_DATA,
      adultes: 5,
      enfants: null,
    });

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(5);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie enfants seul', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.parts = null;
    utilisateur.onboardingData = new Onboarding({
      ...ONBOARDING_DATA,
      adultes: null,
      enfants: 4,
    });

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
      id: KYCID.KYC007,
      id_cms: 7,
      question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      categorie: Categorie.mission,
      points: 5,
      tags: [],
      reponses: [{ label: 'Café', code: 'cafe' }],
      reponses_possibles: [
        { label: 'Café', code: 'cafe' },
        { label: 'Thé ou tisane', code: 'the' },
        { label: 'Chicoré', code: 'chicore' },
      ],
      universes: [],
    });

    // WHEN
    user.increaseTagForAnswers(Tag.climat, kyc, {
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
      id: KYCID.KYC007,
      id_cms: 7,
      question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      categorie: Categorie.mission,
      points: 5,
      tags: [],
      reponses: [{ label: 'autre', code: 'autre' }],
      reponses_possibles: [
        { label: 'Café', code: 'cafe' },
        { label: 'Thé ou tisane', code: 'the' },
        { label: 'Chicoré', code: 'chicore' },
        { label: 'autre', code: 'autre' },
      ],
      universes: [],
    });

    // WHEN
    user.increaseTagForAnswers(Tag.climat, kyc, {
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
      'A',
      'B',
      'w@w.com',
      1234,
      /*
      new Onboarding({
        version: 0,
        transports: [TransportQuotidien.velo, TransportQuotidien.voiture],
        avion: 2,
        adultes: 2,
        enfants: 2,
        residence: TypeLogement.maison,
        proprietaire: true,
        superficie: Superficie.superficie_35,
        chauffage: Chauffage.bois,
        repas: Repas.vege,
        consommation: Consommation.raisonnable,
        code_postal: '91120',
        commune: 'Palaiseau',
      }),
      */
    );
    user.tag_ponderation_set = {};

    const kyc = new QuestionKYC({
      id: KYCID.KYC007,
      id_cms: 7,
      question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      categorie: Categorie.mission,
      points: 5,
      tags: [],
      reponses: [
        { label: 'Thé ou tisane', code: 'the' },
        { label: 'CHI', code: 'chicore' },
      ],
      reponses_possibles: [
        { label: 'Café', code: 'cafe' },
        { label: 'Thé ou tisane', code: 'the' },
        { label: 'Chicoré', code: 'chicore' },
        { label: 'autre', code: 'autre' },
      ],
      universes: [],
    });

    // WHEN
    user.increaseTagForAnswers(Tag.climat, kyc, {
      cafe: 100,
      the: 50,
      chicore: 10,
    });

    // THEN
    expect(user.tag_ponderation_set.climat).toEqual(60);
  });
});
