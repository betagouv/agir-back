import { Injectable } from '@nestjs/common';
import Vers from 'vers';
import { Versioned } from './versioned';

export enum DomainClassName {
  UnlockedFeatures = 'UnlockedFeatures',
}
@Injectable()
export class ObjectUpgrader {
  private converters: Map<string, Vers>;

  constructor() {
    this.converters = new Map();
    this.addSerialisable_UnlockedFeatures();
  }

  public async upgrade(object: Versioned): Promise<Object> {
    const className = object.constructor.name;
    console.log(className);

    const converter = this.converters.get(className);

    const last_version_object = await converter.fromToLatest(
      object.version,
      object,
    );

    return last_version_object;
  }

  private addSerialisable_UnlockedFeatures() {
    const vers = new Vers();
    vers.addConverter(1, 2, (obj) => {
      obj.version = 2;
    });
    this.converters.set('Serialisable_UnlockedFeatures', vers);
  }
}
