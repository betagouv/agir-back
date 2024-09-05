import { ExtraUnivers } from './extraUnivers';

export class UniversExtraLabels {
  static labels: Record<ExtraUnivers, string> = {
    premiers_pas: 'Vos premiers pas',
    services_societaux: 'Services sociétaux',
  };

  public static getLabel(extra_univers: string): string {
    const result = UniversExtraLabels.labels[extra_univers];
    return result || 'Titre manquant';
  }
}
