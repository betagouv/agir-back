import {
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';
import { Logement } from '../../../../src/domain/logement/logement';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../src/domain/kyc/questionKYC';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';

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
      short_question: 'short',
      image_url: 'https://',
      conditions: [],
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
      short_question: 'short',
      image_url: 'https://',
      conditions: [],
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
      'w@w.com',
      false,
      SourceInscription.inconnue,
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
      short_question: 'short',
      image_url: 'https://',
      conditions: [],
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
