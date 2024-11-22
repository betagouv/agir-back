import {
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';
import { Logement } from '../../../../src/domain/logement/logement';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
  Unite,
} from '../../../../src/domain/kyc/questionKYC';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { Thematique } from '../../../../src/domain/contenu/thematique';

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
    { label: 'Café', code: 'cafe', ngc_code: undefined, value: 'oui' },
    {
      label: 'Thé ou tisane',
      code: 'the',
      ngc_code: undefined,
      value: undefined,
    },
    {
      label: 'Chicoré',
      code: 'chicore',
      ngc_code: undefined,
      value: undefined,
    },
  ],
  thematiques: [],
  short_question: 'short',
  image_url: 'https://',
  conditions: [],
  unite: Unite.euro,
  emoji: '🔥',
  reponse_simple: undefined,
  thematique: Thematique.alimentation,
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
      id_cms: 7,
      question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      a_supprimer: false,
      categorie: Categorie.mission,
      points: 5,
      tags: [],
      reponse_complexe: [
        { label: 'Café', code: 'cafe', ngc_code: undefined, value: 'oui' },
        {
          label: 'Thé ou tisane',
          code: 'the',
          ngc_code: undefined,
          value: undefined,
        },
        {
          label: 'Chicoré',
          code: 'chicore',
          ngc_code: undefined,
          value: undefined,
        },
      ],
      short_question: 'short',
      image_url: 'https://',
      conditions: [],
      unite: Unite.euro,
      emoji: '🔥',
      reponse_simple: undefined,
      thematique: Thematique.alimentation,
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
      ...KYC,
      id_cms: 7,
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      a_supprimer: false,
      reponse_complexe: [
        { label: 'autre', code: 'autre', ngc_code: undefined, value: 'oui' },
        { label: 'Café', code: 'cafe', ngc_code: undefined, value: undefined },
        {
          label: 'Thé ou tisane',
          code: 'the',
          ngc_code: undefined,
          value: undefined,
        },
        {
          label: 'Chicoré',
          code: 'chicore',
          ngc_code: undefined,
          value: undefined,
        },
      ],
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
      ...KYC,
      code: KYCID.KYC007,
      id_cms: 7,
      question: 'Quelle boisson chaude consommez-vous quotidiennement ?',
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: false,
      reponse_complexe: [
        {
          label: 'Thé ou tisane',
          code: 'the',
          ngc_code: undefined,
          value: 'oui',
        },
        { label: 'CHI', code: 'chicore', ngc_code: undefined, value: 'oui' },
        { label: 'Café', code: 'cafe', ngc_code: undefined, value: undefined },
        {
          label: 'autre',
          code: 'autre',
          ngc_code: undefined,
          value: undefined,
        },
      ],
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
