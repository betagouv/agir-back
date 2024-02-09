import Vers from 'vers';
import { Translator } from './translator';

type Constructor = { new (...args: any[]): any };

export class SelfUpgrader<DomainType extends Constructor> {
  private versionner: Vers;
  private ctor_domain: DomainType;

  constructor(translators: Translator[], ctor: DomainType) {
    this.ctor_domain = ctor;
    this.versionner = new Vers();
    translators.forEach((translator) => {
      this.versionner.addConverter(
        translator.source_version,
        translator.target_version,
        translator.translate_function,
      );
    });
  }

  async toDomain(raw_data: object): Promise<DomainType> {
    const current_version = raw_data['version'] || 1;

    const upgraded_raw_data = await this.versionner.fromToLatest(
      current_version,
      raw_data,
    );

    return new this.ctor_domain(upgraded_raw_data);
  }
}
