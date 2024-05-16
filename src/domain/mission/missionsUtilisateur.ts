import { MissionsUtilisateur_v0 } from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Mission } from './mission';

export class MissionsUtilisateur {
  missions: Mission[];

  constructor(data?: MissionsUtilisateur_v0) {
    this.missions = [];
    if (data && data.missions) {
      data.missions.forEach((m) => {
        this.missions.push(new Mission(m));
      });
    }
  }

  public getMission(them: ThematiqueUnivers): Mission {
    return this.missions.find((m) => m.thematique_univers === them);
  }
}
