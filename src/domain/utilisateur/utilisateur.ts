import { CodeManager } from './manager/codeManager';
import { PasswordManager } from './manager/passwordManager';
import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Gamification } from '../gamification/gamification';
import { ParcoursTodo } from '../todo/parcoursTodo';
import { UnlockedFeatures } from '../gamification/unlockedFeatures';
import { History } from '../history/history';
import { KYCHistory } from '../kyc/kycHistory';
import { Logement } from '../logement/logement';
import { App } from '../app';
import { TagPonderationSet } from '../scoring/tagPonderationSet';
import { Tag } from '../scoring/tag';
import { DefiHistory } from '../defis/defiHistory';
import { UserTagEvaluator } from '../scoring/userTagEvaluator';
import { QuestionKYC } from '../kyc/questionKYC';
import { MissionsUtilisateur } from '../mission/missionsUtilisateur';
import { BibliothequeServices } from '../bibliotheque_services/bibliothequeServices';
import { KYCID } from '../kyc/KYCID';
import validator from 'validator';
import { NotificationHistory } from '../notification/notificationHistory';
var crypto = require('crypto');
import { v4 as uuidv4 } from 'uuid';

export enum UtilisateurStatus {
  default = 'default',
  creation_compte_etape_1 = 'creation_compte_etape_1',
  connexion_etape_1 = 'connexion_etape_1',
  mot_de_passe_oublie_etape_1 = 'mot_de_passe_oublie_etape_1',
}

export enum SourceInscription {
  web = 'web',
  mobile = 'mobile',
  web_ngc = 'web_ngc',
  france_connect = 'france_connect',
  inconnue = 'inconnue',
}
export enum Scope {
  ALL = 'ALL',
  core = 'core',
  todo = 'todo',
  gamification = 'gamification',
  history_article_quizz_aides = 'history_article_quizz_aides',
  kyc = 'kyc',
  unlocked_features = 'unlocked_features',
  logement = 'logement',
  defis = 'defis',
  missions = 'missions',
  bilbiotheque_services = 'bilbiotheque_services',
  notification_history = 'notification_history',
}

export class Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  annee_naissance: number;
  revenu_fiscal: number;
  parts: number;
  abonnement_ter_loire: boolean;
  created_at: Date;
  updated_at?: Date;
  passwordHash: string;
  passwordSalt: string;
  failed_login_count: number;
  prevent_login_before: Date;
  code: string;
  code_generation_time: Date;
  active_account: boolean;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;
  sent_email_count: number;
  prevent_sendemail_before: Date;
  parcours_todo: ParcoursTodo;
  gamification: Gamification;
  missions: MissionsUtilisateur;
  history: History;
  unlocked_features: UnlockedFeatures;
  version: number;
  migration_enabled: boolean;
  kyc_history: KYCHistory;
  logement: Logement;
  tag_ponderation_set: TagPonderationSet;
  defi_history: DefiHistory;
  force_connexion: boolean;
  derniere_activite: Date;
  db_version: number;
  bilbiotheque_services: BibliothequeServices;
  is_magic_link_user: boolean;
  points_classement: number;
  code_postal_classement: string;
  commune_classement: string;
  rank: number;
  rank_commune: number;
  status: UtilisateurStatus;
  couverture_aides_ok: boolean;
  source_inscription: SourceInscription;
  notification_history: NotificationHistory;
  unsubscribe_mail_token: string;
  est_valide_pour_classement: boolean;
  brevo_created_at: Date;
  brevo_updated_at: Date;
  mobile_token: string;
  mobile_token_updated_at: Date;
  code_commune: string;
  france_connect_sub: string;

  constructor(data?: Utilisateur) {
    if (data) {
      Object.assign(this, data);
    }
    if (!this.failed_login_count) this.failed_login_count = 0;
    if (!this.prevent_login_before) this.prevent_login_before = new Date();
    if (!this.sent_email_count) this.sent_email_count = 0;
    if (this.active_account === undefined) this.active_account = false;
    if (!this.failed_checkcode_count) this.failed_checkcode_count = 0;
    if (!this.prevent_checkcode_before)
      this.prevent_checkcode_before = new Date();
    if (!this.prevent_sendemail_before)
      this.prevent_sendemail_before = new Date();
  }

  public static createNewUtilisateur(
    email: string,
    is_magic_link: boolean,
    source_inscription: SourceInscription,
  ): Utilisateur {
    return new Utilisateur({
      nom: null,
      prenom: null,
      email: email,
      id: uuidv4(),
      revenu_fiscal: null,
      parts: null,
      abonnement_ter_loire: false,
      passwordHash: null,
      passwordSalt: null,
      active_account: false,
      code: null,
      code_generation_time: null,
      created_at: undefined,
      migration_enabled: false,
      failed_checkcode_count: 0,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      prevent_checkcode_before: new Date(),
      sent_email_count: 1,
      prevent_sendemail_before: new Date(),
      parcours_todo: new ParcoursTodo(),
      gamification: new Gamification(),
      unlocked_features: new UnlockedFeatures(),
      history: new History(),
      kyc_history: new KYCHistory(),
      defi_history: new DefiHistory(),
      version: App.currentUserSystemVersion(),
      logement: new Logement({
        version: 0,
        dpe: null,
        plus_de_15_ans: null,
        chauffage: null,
        code_postal: null,
        commune: null,
        nombre_adultes: null,
        nombre_enfants: null,
        proprietaire: null,
        superficie: null,
        type: null,
      }),
      tag_ponderation_set: {},
      force_connexion: false,
      derniere_activite: new Date(),
      missions: new MissionsUtilisateur(),
      annee_naissance: null,
      db_version: 0,
      bilbiotheque_services: new BibliothequeServices(),
      is_magic_link_user: is_magic_link,
      rank: null,
      rank_commune: null,
      code_postal_classement: null,
      commune_classement: null,
      points_classement: 0,
      status: UtilisateurStatus.default,
      couverture_aides_ok: false,
      source_inscription: source_inscription,
      notification_history: new NotificationHistory(),
      unsubscribe_mail_token: Utilisateur.generateEmailToken(),
      est_valide_pour_classement: false,
      brevo_created_at: null,
      brevo_updated_at: null,
      mobile_token_updated_at: null,
      mobile_token: null,
      code_commune: null,
      france_connect_sub: null,
    });
  }

  public resetAllHistory?() {
    this.points_classement = 0;
    this.commune_classement = null;
    this.code_postal_classement = null;
    this.tag_ponderation_set = {};
    this.parcours_todo.reset();
    this.gamification.reset();
    this.unlocked_features.reset();
    this.history.reset();
    this.defi_history.reset();
    this.kyc_history.reset();
  }

  public setUnsubscribeEmailTokenIfMissing?() {
    if (!this.unsubscribe_mail_token) {
      this.unsubscribe_mail_token = Utilisateur.generateEmailToken();
    }
  }

  public vientDeNGC?() {
    return this.source_inscription === SourceInscription.web_ngc;
  }

  private static generateEmailToken?(): string {
    return crypto.randomUUID();
  }

  public isOnboardingDone?(): boolean {
    const KYC_preference_answered = this.kyc_history.isQuestionAnsweredByCode(
      KYCID.KYC_preference,
    );

    const ok_prenom = !!this.prenom && this.prenom !== '';

    const ok_code_postal =
      !!this.logement.code_postal && this.logement.code_postal.length === 5;

    return ok_prenom && ok_code_postal && KYC_preference_answered;
  }

  public isMagicLinkCodeExpired?(): boolean {
    return (
      this.code === null ||
      this.code_generation_time.getTime() < Date.now() - 1000 * 60 * 60
    );
  }
  static checkState?(utilisateur: Utilisateur) {
    if (!utilisateur) {
      ApplicationError.throwMissingUser();
    }
    if (utilisateur.force_connexion) {
      ApplicationError.throwPleaseReconnect();
    }
  }

  public getNombrePartsFiscalesOuEstimee?() {
    if (this.parts !== null) {
      return this.parts;
    }
    let parts_estimee = 0;
    if (this.logement.nombre_adultes) {
      parts_estimee += this.logement.nombre_adultes;
    }
    if (this.logement.nombre_enfants) {
      const total_enfants =
        this.logement.nombre_enfants > 2
          ? this.logement.nombre_enfants
          : this.logement.nombre_enfants * 0.5;
      parts_estimee += total_enfants;
    }
    return parts_estimee === 0 ? 1 : parts_estimee;
  }

  /**
   * Returns the total number of people in the household, including adults and
   * children (see {@link UtilisateurData.logement}).
   *
   * @ensures The result to be in the range [1, +∞[.
   */
  public getNombrePersonnesDansLogement?(): number {
    return Math.max(
      this.logement.nombre_adultes + this.logement.nombre_enfants,
      1,
    );
  }

  public setPassword?(password: string) {
    PasswordManager.setUserPassword(this, password);
  }

  public setNew6DigitCode?() {
    CodeManager.setNew6DigitCode(this);
    this.code_generation_time = new Date();
  }

  public static checkEmailFormat(email: string) {
    if (!validator.isEmail(email)) {
      ApplicationError.throwBaddEmailFormatError(email);
    }
  }

  public does_get_article_quizz_from_repo?(): boolean {
    return this.version > 0;
  }

  public isAdmin?(): boolean {
    return App.isAdmin(this.id);
  }

  public increaseTagValue?(tag: Tag, value: number) {
    this.setTagValue(tag, this.getTagValue(tag) + value);
  }
  public increaseTagForAnswers?(
    tag: Tag,
    kyc: QuestionKYC,
    map: Record<string, number>,
  ) {
    if (kyc && kyc.hasAnyResponses()) {
      for (const key in map) {
        if (kyc.isSelectedReponseCode(key)) {
          this.increaseTagValue(tag, map[key]);
        }
      }
    }
  }
  public increaseTagValueIfElse?(
    tag: Tag,
    when: boolean,
    value_yes: number,
    value_no: number,
  ) {
    this.setTagValue(
      tag,
      this.getTagValue(tag) + (when ? value_yes : value_no),
    );
  }

  public recomputeRecoTags?() {
    UserTagEvaluator.recomputeRecoTags(this);
  }

  public getTagValue?(tag: Tag) {
    return this.tag_ponderation_set[tag] ? this.tag_ponderation_set[tag] : 0;
  }
  public setTagValue?(tag: Tag, value: number) {
    this.tag_ponderation_set[tag] = value;
  }
}
