import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import Publicodes from 'publicodes';

const filePath = path.join(process.cwd(), 'src/publicode/retrofit.yaml');
const aidesRetrofit = yaml.load(fs.readFileSync(filePath, 'utf8')) as Record<
  string,
  any
>;
export const engine = new Publicodes(aidesRetrofit);

export function getEngine(situation: any) {
  const engineBis = engine.shallowCopy();
  engineBis.setSituation(situation ?? {});
  return engineBis;
}
