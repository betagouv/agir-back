import { Badge } from '../badge/badge';
import { UserQuizzProfile } from '../quizz/userQuizzProfile';
import { CodeManager } from './manager/codeManager';
import { Onboarding } from './onboarding/onboarding';
import { OnboardingResult } from './onboarding/onboardingResult';
import { PasswordManager } from './manager/passwordManager';
import { Todo } from '../todo/todo';
import { ApplicationError } from '../../../src/infrastructure/applicationError';

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
  points: number;
  quizzProfile: UserQuizzProfile;
  created_at: Date;
  passwordHash: string;
  passwordSalt: string;
  failed_login_count: number;
  prevent_login_before: Date;
  code: string;
  active_account: boolean;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;
  sent_email_count: number;
  prevent_sendemail_before: Date;
  todo: Todo;
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

  public setPassword(password: string) {
    PasswordManager.setUserPassword(this, password);
  }

  public setNew6DigitCode() {
    CodeManager.setNew6DigitCode(this);
  }

  public static checkEmailFormat(email: string) {
    // FIXME : move to mail manager
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      ApplicationError.throwBaddEmailFormatError(email);
    }
  }
}
