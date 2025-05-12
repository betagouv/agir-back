import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { App } from '../app';
import { BibliothequeServices } from '../bibliotheque_services/bibliothequeServices';
import { CacheBilanCarbone } from '../bilan/cacheBilanCarbone';
import { Gamification } from '../gamification/gamification';
import { History } from '../history/history';
import { KYCID } from '../kyc/KYCID';
import { KYCHistory } from '../kyc/kycHistory';
import { QuestionChoixUnique } from '../kyc/new_interfaces/QuestionChoixUnique';
import { Logement } from '../logement/logement';
import { NotificationHistory } from '../notification/notificationHistory';
import { ProfileRecommandationUtilisateur } from '../scoring/system_v2/profileRecommandationUtilisateur';
import { Tag } from '../scoring/tag';
import { TagPonderationSet } from '../scoring/tagPonderationSet';
import { UserTagEvaluator } from '../scoring/userTagEvaluator';
import { ThematiqueHistory } from '../thematique/history/thematiqueHistory';
import { CodeManager } from './manager/codeManager';
import { PasswordManager } from './manager/passwordManager';
var crypto = require('crypto');

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
  magic_link = 'magic_link',
  inconnue = 'inconnue',
}
export enum GlobalUserVersion {
  V1 = 'V1',
  V2 = 'V2',
}
export enum Scope {
  ALL = 'ALL',
  core = 'core',
  gamification = 'gamification',
  history_article_quizz_aides = 'history_article_quizz_aides',
  kyc = 'kyc',
  logement = 'logement',
  bilbiotheque_services = 'bilbiotheque_services',
  notification_history = 'notification_history',
  thematique_history = 'thematique_history',
  cache_bilan_carbone = 'cache_bilan_carbone',
  recommandation = 'recommandation',
}

export class UtilisateurData {
  id: string;
  email: string;
  pseudo: string;
  nom: string;
  prenom: string;
  annee_naissance: number;
  mois_naissance: number;
  jour_naissance: number;
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
  gamification: Gamification;
  history: History;
  version: number;
  migration_enabled: boolean;
  kyc_history: KYCHistory;
  logement?: Logement;
  tag_ponderation_set: TagPonderationSet;
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
  thematique_history: ThematiqueHistory;
  unsubscribe_mail_token: string;
  est_valide_pour_classement: boolean;
  brevo_created_at: Date;
  brevo_updated_at: Date;
  brevo_update_disabled: boolean;
  mobile_token: string;
  mobile_token_updated_at: Date;
  code_commune: string; // FIXME : deprecated , à supprimer dès que celui de logement est mis en service
  france_connect_sub: string;
  external_stat_id: string;
  cache_bilan_carbone: CacheBilanCarbone;
  recommandation: ProfileRecommandationUtilisateur;
  global_user_version: GlobalUserVersion;

  constructor(data?: UtilisateurData) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class Utilisateur extends UtilisateurData {
  constructor(data?: UtilisateurData) {
    super(data);

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
      id: uuidv4(),
      pseudo: null,
      nom: null,
      prenom: null,
      email: email,
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
      gamification: new Gamification(),
      history: new History(),
      kyc_history: new KYCHistory(),
      version: App.currentUserSystemVersion(),
      logement: new Logement(),
      tag_ponderation_set: {},
      force_connexion: false,
      derniere_activite: new Date(),
      annee_naissance: null,
      mois_naissance: null,
      jour_naissance: null,
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
      thematique_history: new ThematiqueHistory(),
      unsubscribe_mail_token: Utilisateur.generateEmailToken(),
      est_valide_pour_classement: false,
      brevo_created_at: null,
      brevo_updated_at: null,
      brevo_update_disabled: false,
      mobile_token_updated_at: null,
      mobile_token: null,
      code_commune: null,
      france_connect_sub: null,
      external_stat_id: uuidv4(),
      cache_bilan_carbone: new CacheBilanCarbone(),
      recommandation: new ProfileRecommandationUtilisateur(),
      global_user_version: GlobalUserVersion.V2,
    });
  }

  public resetPourLancementNational() {
    this.points_classement = 0;
    this.force_connexion = true;
    this.gamification.resetV2();
    this.thematique_history.reset();
  }

  public resetAllHistory() {
    this.points_classement = 0;
    this.commune_classement = null;
    this.code_postal_classement = null;
    this.tag_ponderation_set = {};
    this.gamification.reset();
    this.history.reset();
    this.kyc_history.reset();
    this.thematique_history.reset();
    this.notification_history.reset();
  }

  public isV2User(): boolean {
    return this.global_user_version === GlobalUserVersion.V2;
  }
  public isV1User(): boolean {
    return this.global_user_version === GlobalUserVersion.V1;
  }

  public isUtilisateurFranceConnecte() {
    return !!this.france_connect_sub;
  }

  public isDataFranceConnectModifiable() {
    return !this.isUtilisateurFranceConnecte();
  }

  public setUnsubscribeEmailTokenIfMissing() {
    if (!this.unsubscribe_mail_token) {
      this.unsubscribe_mail_token = Utilisateur.generateEmailToken();
    }
  }

  public getDateNaissanceString(): string {
    if (!this.mois_naissance || !this.mois_naissance || !this.jour_naissance) {
      return 'missing';
    }
    let zero_mois = this.mois_naissance < 10 ? '0' : '';
    let zero_jour = this.jour_naissance < 10 ? '0' : '';
    return (
      '' +
      this.annee_naissance +
      '-' +
      zero_mois +
      this.mois_naissance +
      '-' +
      zero_jour +
      this.jour_naissance
    );
  }
  public vientDeNGC() {
    return this.source_inscription === SourceInscription.web_ngc;
  }

  public isMobileNotificationSet(): boolean {
    return !!this.mobile_token;
  }

  private static generateEmailToken(): string {
    return crypto.randomUUID();
  }

  public isOnboardingDone(): boolean {
    const kyc = this.kyc_history.getQuestionChoixMultiple(KYCID.KYC_preference);
    const KYC_preference_answered = !!kyc && kyc.isAnswered();

    const ok_pseudo = !!this.pseudo && this.pseudo !== '';
    const ok_prenom = !!this.prenom && this.prenom !== '';

    const ok_code_postal =
      !!this.logement.code_postal && this.logement.code_postal.length === 5;

    const date_naissance_ok =
      this.isV1User() ||
      (!!this.annee_naissance &&
        !!this.mois_naissance &&
        !!this.jour_naissance);
    return (
      (ok_pseudo || ok_prenom) &&
      ok_code_postal &&
      KYC_preference_answered &&
      date_naissance_ok
    );
  }

  public isMagicLinkCodeExpired(): boolean {
    return (
      !this.code ||
      !this.code_generation_time ||
      this.code_generation_time.getTime() < Date.now() - 1000 * 60 * 60
    );
  }
  static checkState(utilisateur: Utilisateur) {
    if (!utilisateur) {
      ApplicationError.throwMissingUser();
    }
    if (utilisateur.force_connexion) {
      ApplicationError.throwPleaseReconnect();
    }
  }

  public getNombrePartsFiscalesOuEstimee() {
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
   * children (see {@link Utilisateur.logement}).
   * Si pas d'info, retourne 1 par défaut
   *
   * @ensures The result to be in the range [1, +∞[.
   */
  public getNombrePersonnesDansLogement(): number {
    return Math.max(
      (this.logement.nombre_adultes ? this.logement.nombre_adultes : 0) +
        (this.logement.nombre_enfants ? this.logement.nombre_enfants : 0),
      1,
    );
  }

  public setPassword(password: string) {
    PasswordManager.setUserPassword(this, password);
  }

  public setNew6DigitCode() {
    CodeManager.setNew6DigitCode(this);
    this.code_generation_time = new Date();
  }

  public setNewUUIDCode() {
    CodeManager.setNewUUIDCode(this);
    this.code_generation_time = new Date();
  }

  public static checkEmailFormat(email: string) {
    if (!validator.isEmail(email)) {
      ApplicationError.throwBaddEmailFormatError(email);
    }
  }

  public does_get_article_quizz_from_repo(): boolean {
    return this.version > 0;
  }

  public isAdmin(): boolean {
    return App.isAdmin(this.id);
  }

  public increaseTagValue(tag: Tag, value: number) {
    this.setTagValue(tag, this.getTagValue(tag) + value);
  }
  public increaseTagForAnswers(
    tag: Tag,
    kyc: QuestionChoixUnique,
    map: Record<string, number>,
  ) {
    if (kyc && kyc.isAnswered()) {
      for (const key in map) {
        if (kyc.isSelected(key)) {
          this.increaseTagValue(tag, map[key]);
        }
      }
    }
  }
  public increaseTagValueIfElse(
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

  public recomputeRecoTags() {
    UserTagEvaluator.recomputeRecoTags(this);
  }

  public getTagValue(tag: Tag) {
    return this.tag_ponderation_set[tag] ? this.tag_ponderation_set[tag] : 0;
  }
  public setTagValue(tag: Tag, value: number) {
    this.tag_ponderation_set[tag] = value;
  }
}
