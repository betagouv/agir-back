import { Injectable } from '@nestjs/common';

import Publicodes from 'publicodes';

import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BilanUsecase {
  async getBilan(simulation): Promise<any> {
    const rules = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../publicode/co2.json'), 'utf8'),
    );

    const engine = new Publicodes(rules);

    const result = engine.setSituation(simulation).evaluate('bilan').nodeValue;

    return result;
  }
}
