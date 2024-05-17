import { MissionsUtilisateur_v0 } from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Mission, Objectif } from './mission';

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

  public getMissionByThematiqueUnivers(them: ThematiqueUnivers): Mission {
    return this.missions.find((m) => m.thematique_univers === them);
  }
  public getMissionById(missionId: string): Mission {
    return this.missions.find((m) => m.id === missionId);
  }

  public answerKyc(kycID: string) {
    this.missions.forEach((mission) => {
      mission.answerKyc(kycID);
    });
  }
}
