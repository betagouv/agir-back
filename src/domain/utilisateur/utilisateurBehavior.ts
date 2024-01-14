export class UtilisateurBehavior {
  public static does_init_interactions_from_def(): boolean {
    return UtilisateurBehavior.systemVersion() === 0;
  }
  public static systemVersion(): number {
    return Number.parseInt(process.env.USER_CURRENT_VERSION) || 0;
  }
  public static ponderationSystemVersion(): number {
    return Number.parseInt(process.env.PONDERATION_VERSION) || 0;
  }
}
