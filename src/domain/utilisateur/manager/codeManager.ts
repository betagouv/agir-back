export type CodeAwareUtilisateur = {
  code: string;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;
  active_account: boolean;
};

export class CodeManager {
  private static MAX_CODE_ATTEMPT = 3;
  private static BLOCKED_CODE_DURATION_MIN = 5;

  public static isCodeLocked(utilisateur: CodeAwareUtilisateur): boolean {
    return Date.now() < utilisateur.prevent_checkcode_before.getTime();
  }

  public static setNew6DigitCode(utilisateur: CodeAwareUtilisateur) {
    utilisateur.code = Math.floor(100000 + Math.random() * 900000).toString();
  }

  public static checkCodeOKAndChangeState(
    utilisateur: CodeAwareUtilisateur,
    code: string,
  ): boolean {
    const ok = utilisateur.code === code;
    if (ok) {
      CodeManager.validateUser(utilisateur);
    } else {
      CodeManager.failCode(utilisateur);
    }
    return ok;
  }

  private static failCode(utilisateur: CodeAwareUtilisateur) {
    utilisateur.failed_checkcode_count++;
    if (utilisateur.failed_checkcode_count > this.MAX_CODE_ATTEMPT) {
      CodeManager.incrementNextAllowedCodeTime(utilisateur);
    }
  }

  private static validateUser(utilisateur: CodeAwareUtilisateur) {
    utilisateur.active_account = true;
  }

  private static incrementNextAllowedCodeTime(
    utilisateur: CodeAwareUtilisateur,
  ) {
    if (utilisateur.prevent_checkcode_before.getTime() <= Date.now()) {
      utilisateur.prevent_checkcode_before = new Date();
    }
    utilisateur.prevent_checkcode_before.setMinutes(
      utilisateur.prevent_checkcode_before.getMinutes() +
        CodeManager.BLOCKED_CODE_DURATION_MIN,
    );
  }
}
