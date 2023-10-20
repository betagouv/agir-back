export type CodeEmailAwareUtilisateur = {
  sent_code_count: number;
  prevent_sendcode_before: Date;
};

export class CodeEmailManager {
  private static MAX_CODE_EMAIL_ATTEMPT = 3;
  private static BLOCKED_CODE_EMAIL_DURATION_MIN = 5;

  public static resetCodeSendingState(utilisateur: CodeEmailAwareUtilisateur) {
    utilisateur.sent_code_count = 0;
    utilisateur.prevent_sendcode_before = new Date();
  }

  public static isCodeEmailLocked(
    utilisateur: CodeEmailAwareUtilisateur,
  ): boolean {
    return Date.now() < utilisateur.prevent_sendcode_before.getTime();
  }

  public static resetCodeEmailCouterIfNeeded(
    utilisateur: CodeEmailAwareUtilisateur,
  ) {
    if (
      utilisateur.sent_code_count > CodeEmailManager.MAX_CODE_EMAIL_ATTEMPT &&
      utilisateur.prevent_sendcode_before.getTime() < Date.now()
    ) {
      utilisateur.sent_code_count = 0;
    }
  }

  public static incrementCodeEmailCount(
    utilisateur: CodeEmailAwareUtilisateur,
  ) {
    utilisateur.sent_code_count++;
    if (
      utilisateur.sent_code_count >= CodeEmailManager.MAX_CODE_EMAIL_ATTEMPT
    ) {
      utilisateur.prevent_sendcode_before.setMinutes(
        utilisateur.prevent_sendcode_before.getMinutes() +
          CodeEmailManager.BLOCKED_CODE_EMAIL_DURATION_MIN,
      );
    }
  }
}
