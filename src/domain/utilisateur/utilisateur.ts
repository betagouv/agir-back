import { UserQuizzProfile } from '../quizz/userQuizzProfile';
import { CodeManager } from './manager/codeManager';
import { Onboarding } from './onboarding/onboarding';
import { OnboardingResult } from './onboarding/onboardingResult';
import { PasswordManager } from './manager/passwordManager';
import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Gamification } from '../gamification/gamification';
import { ParcoursTodo } from '../todo/parcoursTodo';
import { UnlockedFeatures } from '../gamification/unlockedFeatures';
import { History } from '../history/history';

export class UtilisateurData {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  onboardingData: Onboarding;
  onboardingResult: OnboardingResult;
  code_postal: string;
  commune: string;
  revenu_fiscal: number;
  parts: number;
  abonnement_ter_loire: boolean;
  prm: string;
  code_departement: string;
  quizzProfile: UserQuizzProfile;
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
  unlocked_features: UnlockedFeatures;
  version: number;
  migration_enabled: boolean;
}

export class Utilisateur extends UtilisateurData {
  constructor(data: UtilisateurData) {
    super();
    Object.assign(this, data);
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

  public getNombrePartsFiscalesOuEstimee() {
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

  public setPassword(password: string) {
    PasswordManager.setUserPassword(this, password);
  }

  public setNew6DigitCode() {
    CodeManager.setNew6DigitCode(this);
    this.code_generation_time = new Date();
  }

  public static checkEmailFormat(email: string) {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      ApplicationError.throwBaddEmailFormatError(email);
    }
  }

  public does_get_article_quizz_from_repo(): boolean {
    return this.version > 0;
  }
}
