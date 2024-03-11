import { CodeManager } from './manager/codeManager';
import { Onboarding, TransportOnboarding } from './onboarding/onboarding';
import { OnboardingResult } from './onboarding/onboardingResult';
import { PasswordManager } from './manager/passwordManager';
import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Gamification } from '../gamification/gamification';
import { ParcoursTodo } from '../todo/parcoursTodo';
import { UnlockedFeatures } from '../gamification/unlockedFeatures';
import { History } from '../history/history';
import { Environment } from '../environment';
import { KYC } from '../kyc/kyc';
import { Equipements } from '../equipements/equipements';
import { Logement } from './logement';
import { UtilisateurBehavior } from './utilisateurBehavior';
import {
  PonderationTagHelper,
  PonderationTagSet,
  Tag,
} from './ponderationTags';

export class UtilisateurData {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  onboardingData: Onboarding;
  onboardingResult: OnboardingResult;
  code_postal: string; // FIXME to delete
  commune: string; // FIXME to delete
  revenu_fiscal: number;
  parts: number;
  abonnement_ter_loire: boolean;
  code_departement: string;
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
  history: History;
  equipements: Equipements;
  unlocked_features: UnlockedFeatures;
  version: number;
  migration_enabled: boolean;
  ponderationId: string;
  kyc: KYC;
  logement: Logement;
  ponderation_tags: PonderationTagSet;
}

export class Utilisateur extends UtilisateurData {
  constructor(data?: UtilisateurData) {
    super();
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
    nom: string,
    prenom: string,
    email: string,
    onboarding: Onboarding,
  ): Utilisateur {
    return new Utilisateur({
      nom: nom,
      code_postal: onboarding.code_postal,
      commune: onboarding.commune,
      prenom: prenom,
      email: email,
      onboardingData: onboarding,
      onboardingResult: OnboardingResult.buildFromOnboarding(onboarding),

      id: undefined,
      code_departement: null,
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
      kyc: new KYC(),
      equipements: new Equipements(),
      version: UtilisateurBehavior.currentUserSystemVersion(),
      ponderationId: UtilisateurBehavior.ponderationRubriques(),
      logement: Logement.buildFromOnboarding(onboarding),
      ponderation_tags: {},
    });
  }

  public getNombrePartsFiscalesOuEstimee?() {
    if (this.parts !== null) {
      return this.parts;
    }
    let parts_estimee = 0;
    if (this.onboardingData && this.onboardingData.adultes) {
      parts_estimee += this.onboardingData.adultes;
    }
    if (this.onboardingData && this.onboardingData.enfants) {
      const total_enfants =
        this.onboardingData.enfants > 2
          ? this.onboardingData.enfants
          : this.onboardingData.enfants * 0.5;
      parts_estimee += total_enfants;
    }
    return parts_estimee === 0 ? 1 : parts_estimee;
  }

  public setPassword?(password: string) {
    PasswordManager.setUserPassword(this, password);
  }

  public setNew6DigitCode?() {
    CodeManager.setNew6DigitCode(this);
    this.code_generation_time = new Date();
  }

  public static checkEmailFormat(email: string) {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      ApplicationError.throwBaddEmailFormatError(email);
    }
  }

  public does_get_article_quizz_from_repo?(): boolean {
    return this.version > 0;
  }

  public isAdmin?(): boolean {
    return Environment.getAdminIdsStringList().includes(this.id);
  }

  public setTag?(tag: Tag, value: number) {
    PonderationTagHelper.addTagToSet(this.ponderation_tags, tag, value);
  }

  public recomputeRecoTags?() {
    if (this.onboardingData.transports.includes(TransportOnboarding.moto))
      this.setTag(Tag.utilise_moto_ou_voiture, 100);
    if (this.onboardingData.transports.includes(TransportOnboarding.voiture))
      this.setTag(Tag.utilise_moto_ou_voiture, 100);

    // FIXME : refacto comme pour logement
    const kyc_101 = this.kyc.getQuestionOrException('101');
    if (kyc_101.reponse && kyc_101.reponse.includes('🚗 Transports'))
      this.setTag(Tag.interet_transports, 50);
  }
}
