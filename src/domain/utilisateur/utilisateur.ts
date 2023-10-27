import { Badge } from '../badge/badge';
import { UserQuizzProfile } from '../quizz/userQuizzProfile';
import { CodeManager } from './manager/codeManager';
import { OnboardingData } from './onboardingData';
import { OnboardingResult } from './onboardingResult';
import { PasswordManager } from './manager/passwordManager';
import { Service } from '../service';

export type UtilisateurConstructorData = {
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
};

export class Utilisateur {
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

  constructor(data: UtilisateurConstructorData) {
    this.id = data.id;
    this.email = data.email;
    this.nom = data.nom;
    this.prenom = data.prenom;
    this.onboardingData = data.onboardingData;
    this.onboardingResult = data.onboardingResult;
    this.code_postal = data.code_postal;
    this.revenu_fiscal = data.revenu_fiscal;
    this.points = data.points;
    this.quizzProfile = data.quizzProfile;
    this.created_at = data.created_at;
    this.badges = data.badges;
    this.services = data.services;

    this.code = data.code;
    this.passwordHash = data.passwordHash;
    this.passwordSalt = data.passwordSalt;
    this.failed_login_count = data.failed_login_count;
    this.prevent_login_before = data.prevent_login_before;
    this.sent_email_count = data.sent_email_count;
    this.active_account = data.active_account;
    this.failed_checkcode_count = data.failed_checkcode_count;
    this.prevent_checkcode_before = data.prevent_checkcode_before;
    this.prevent_sendemail_before = data.prevent_sendemail_before;

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
