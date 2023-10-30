import { Badge } from '../badge/badge';
import { UserQuizzProfile } from '../quizz/userQuizzProfile';
import { CodeManager } from './manager/codeManager';
import { OnboardingData } from './onboardingData';
import { OnboardingResult } from './onboardingResult';
import { PasswordManager } from './manager/passwordManager';
import { Service } from '../service';

export class UtilisateurData {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  onboardingData: OnboardingData;
  onboardingResult: OnboardingResult;
  code_postal: string;
  revenu_fiscal: number;
  points: number;
  quizzProfile: UserQuizzProfile;
  created_at: Date;
  badges: Badge[];
  services: Service[];
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
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      throw new Error(`Format de l'adresse électronique ${email} incorrect`);
    }
  }
}
