import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v0 } from '../object_store/kyc/kycHistory_v0';
import { Tag } from '../scoring/tag';
import { Univers } from '../univers/univers';
import {
  BooleanKYC,
  CategorieQuestionKYC,
  KYCID,
  TypeReponseQuestionKYC,
} from './questionQYC';

const CATALOGUE: QuestionKYC_v0[] = [
  {
    id: KYCID.KYC001,
    question:
      'Sur quel(s) sujet(s) souhaitez-vous en savoir plus pour réduire votre impact environnemental ?',
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    reponses_possibles: [
      { label: '🥦 Alimentation', code: Thematique.alimentation },
      { label: '☀️ Climat et Environnement', code: Thematique.climat },
      { label: '🛒 Consommation durable', code: Thematique.consommation },
      { label: '🗑️ Déchets', code: Thematique.dechet },
      { label: '🏡 Logement', code: Thematique.logement },
      {
        label: '⚽ Loisirs (vacances, sport,...)',
        code: Thematique.loisir,
      },
      { label: '🚗 Transports', code: Thematique.transport },
      { label: 'Aucun / Je ne sais pas', code: 'rien' },
    ],
    universes: [],
  },
  {
    id: KYCID.KYC002,
    question:
      'Quel(s) moyen(s)de transport excluez-vous pour vos trajets du quotidien (travail, course…) ?',
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    thematique: Thematique.transport,
    reponses_possibles: [
      { label: 'Marcher', code: 'marcher' },
      { label: 'Faire du vélo', code: 'faire_velo' },
      { label: 'Co-voiturer', code: 'co_voit' },
      { label: 'Prendre les transports en commun', code: 'TEC' },
      { label: 'Aucun', code: 'aucun' },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID.KYC003,
    question: 'Êtes-vous équipé(e) d’un vélo ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    thematique: Thematique.transport,
    reponses_possibles: [
      { label: 'Oui', code: BooleanKYC.oui },
      { label: 'Non', code: BooleanKYC.non },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID.KYC004,
    question:
      'Comment trouvez-vous les pistes cyclables sur vos trajets du quotidien (trajet effectué plus de 2 fois par semaine)  ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    thematique: Thematique.transport,
    reponses_possibles: [
      {
        label: 'Existantes et facilement praticables',
        code: 'pistes_cyclables_faciles',
      },
      {
        label: 'Existantes mais dangereuses',
        code: 'pistes_cyclables_dangereuses',
      },
      {
        label: 'Il n’y a pas de pistes cyclables',
        code: 'absence_pistes_cyclables',
      },
      { label: 'Je ne sais pas', code: 'ne_sais_pas' },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID.KYC005,
    question: 'Quelle est votre situation professionnelle ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    thematique: Thematique.logement,
    points: 5,
    tags: [],
    reponses_possibles: [
      { label: 'J’ai un emploi', code: 'emploi' },
      { label: 'Je suis sans emploi', code: 'sans_emploi' },
      { label: 'Je ne souhaite pas répondre', code: 'ne_sais_pas' },
    ],
    universes: [],
  },
  {
    id: KYCID.KYC006,
    question: 'Quel est l’âge de votre logement ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    thematique: Thematique.logement,
    reponses_possibles: [
      { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
      { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
    ],
    universes: [Univers.logement],
  },
  {
    id: KYCID.KYC007,
    question: 'Quelle(s) boisson(s) chaude(s) consommez-vous quotidiennement ?',
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.mission,
    points: 5,
    tags: [],
    thematique: Thematique.alimentation,
    reponses_possibles: [
      { label: 'Café', code: 'cafe' },
      { label: 'Thé ou tisane', code: 'the' },
      { label: 'Chicorée', code: 'chicore' },
      { label: 'Autre', code: 'autre' },
      { label: 'Aucune', code: 'aucune' },
    ],
    universes: [Univers.alimentation],
  },
  {
    id: KYCID.KYC008,
    question: 'Votre employeur vous permet-il de télétravailler ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.recommandation,
    points: 5,
    tags: [Tag.possede_emploi],
    thematique: Thematique.transport,
    reponses_possibles: [
      { label: 'Je peux télétravailler à plein temps', code: 'max_tele' },
      {
        label: 'Je peux télétravailler avec un nombre de jours limité',
        code: 'un_peu_tele',
      },
      {
        label: 'Mon emploi ne me permet pas de télétravailler',
        code: 'no_tele',
      },
      { label: 'Je ne souhaite pas répondre', code: 'ne_sais_pas' },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID.KYC009,
    question: 'Comment réalisez-vous vos trajets en voiture ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.recommandation,
    points: 5,
    tags: [Tag.utilise_moto_ou_voiture],
    thematique: Thematique.transport,
    reponses_possibles: [
      { label: 'Avec votre propre voiture', code: 'ma_voit' },
      {
        label: 'En louant une voiture (location courte durée)',
        code: 'loc_voit',
      },
      { label: 'En covoiturage', code: 'co_voit' },
      { label: 'Je ne réalise pas de trajet en voiture', code: 'pas_voiture' },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID.KYC010,
    question: 'Votre maison donne-t-elle accès à un jardin ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.recommandation,
    points: 5,
    tags: [Tag.possede_maison],
    thematique: Thematique.dechet,
    reponses_possibles: [
      { label: 'Oui', code: BooleanKYC.oui },
      { label: 'Non', code: BooleanKYC.non },
    ],
    universes: [Univers.logement],
  },
  {
    id: KYCID.KYC011,
    question:
      'Dans vos trajets du quotidien, quel type de voiture utilisez-vous ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.recommandation,
    points: 5,
    tags: [Tag.utilise_moto_ou_voiture],
    thematique: Thematique.transport,
    reponses_possibles: [
      {
        label: 'Voiture thermique (essence, diesel ou gaz)',
        code: 'voit_therm',
      },
      { label: 'Voiture électrique ou hybride', code: 'voit_elec_hybride' },
      { label: 'Je ne souhaite pas répondre', code: 'ne_sais_pas' },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID.KYC012,
    question:
      'Effectuez-vous quotidiennement des trajets de moins de 10 min en voiture ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.recommandation,
    points: 5,
    tags: [Tag.utilise_moto_ou_voiture],
    thematique: Thematique.transport,
    reponses_possibles: [
      { label: 'Oui', code: BooleanKYC.oui },
      { label: 'Non', code: BooleanKYC.non },
      { label: 'Je ne souhaite pas répondre', code: 'ne_sais_pas' },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID.KYC013,
    question: 'Quel(s) est votre intérêt(s) sur la thématique transport ?',
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.recommandation,
    points: 5,
    tags: [],
    thematique: Thematique.transport,
    reponses_possibles: [
      {
        label: 'Limiter l’impact environnemental de vos trajets quotidiens',
        code: 'limiter_impact',
      },
      { label: 'Acheter ou changer de véhicule', code: 'achat_voit' },
      { label: 'Faire des économies', code: 'economie' },
      { label: 'Bouger pour être en bonne santé', code: 'bouger' },
      { label: 'Autree', code: 'autre' },
      { label: 'Je ne souhaite pas répondre', code: 'ne_sais_pas' },
    ],
    universes: [Univers.transport],
  },
  {
    id: KYCID._1,
    question: 'Comment avez vous connu le service ?',
    type: TypeReponseQuestionKYC.libre,
    is_NGC: false,
    categorie: CategorieQuestionKYC.default,
    points: 10,
    tags: [],
    universes: [],
  },
  {
    id: KYCID._2,
    question: `Quel est votre sujet principal d'intéret ?`,
    type: TypeReponseQuestionKYC.choix_multiple,
    is_NGC: false,
    categorie: CategorieQuestionKYC.default,
    points: 10,
    reponses_possibles: [
      { label: 'Le climat', code: Thematique.climat },
      { label: 'Mon logement', code: Thematique.logement },
      { label: 'Ce que je mange', code: Thematique.alimentation },
    ],
    tags: [],
    universes: [],
  },
  {
    id: KYCID._3,
    question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    categorie: CategorieQuestionKYC.default,
    points: 10,
    reponses_possibles: [
      { label: 'Oui', code: BooleanKYC.oui },
      { label: 'Non', code: BooleanKYC.non },
      { label: 'A voir', code: BooleanKYC.peut_etre },
    ],
    tags: [Tag.logement, Tag.climat],
    universes: [],
  },
  {
    id: KYCID._4,
    question: `Quel est ton age`,
    type: TypeReponseQuestionKYC.entier,
    is_NGC: false,
    categorie: CategorieQuestionKYC.default,
    points: 10,
    tags: [],
    universes: [],
  },
  {
    id: KYCID._5,
    question: `Combient coute un malabar`,
    type: TypeReponseQuestionKYC.decimal,
    is_NGC: false,
    categorie: CategorieQuestionKYC.default,
    points: 10,
    tags: [Tag.consommation, Tag.alimentation],
    universes: [],
  },
];

export class CatalogueQuestionsKYC {
  //private static kyc_catalogue: QuestionKYC_v0[] = CATALOGUE;
  /*
  public static getByCategorie(cat: CategorieQuestionKYC): QuestionKYC[] {
    const result = [];
    CatalogueQuestionsKYC.kyc_catalogue.forEach((e) => {
      if (e.categorie === cat) {
        result.push(new QuestionKYC(e));
      }
    });
    return result;
  }

  public static getAll(categorie?: CategorieQuestionKYC): QuestionKYC[] {
    const result = [];
    CatalogueQuestionsKYC.kyc_catalogue.forEach((e) => {
      if (!categorie || (categorie && e.categorie === categorie))
        result.push(new QuestionKYC(e));
    });
    return result;
  }

  public static getTailleCatalogue(): number {
    return CatalogueQuestionsKYC.kyc_catalogue.length;
  }

  public static getByIdOrException(id: string): QuestionKYC {
    const question = CatalogueQuestionsKYC.kyc_catalogue.find(
      (element) => element.id === id,
    );
    if (question) {
      return new QuestionKYC(question);
    }
    ApplicationError.throwQuestionInconnue(id);
  }
  public static getById(id: KYCID): QuestionKYC {
    return new QuestionKYC(
      CatalogueQuestionsKYC.kyc_catalogue.find((element) => element.id === id),
    );
  }

  public static setCatalogue(catalogue: QuestionKYC_v0[]) {
    CatalogueQuestionsKYC.kyc_catalogue = catalogue;
  }
  public static resetCatalogue() {
    CatalogueQuestionsKYC.kyc_catalogue = CATALOGUE;
  }
  */
}
