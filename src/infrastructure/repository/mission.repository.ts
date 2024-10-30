import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mission } from '@prisma/client';
import { MissionDefinition } from '../../../src/domain/mission/missionDefinition';
import { Cron } from '@nestjs/schedule';
import { App } from '../../domain/app';
import { Thematique } from '../../domain/contenu/thematique';

@Injectable()
export class MissionRepository {
  static catalogue_missions_by_idcms: Map<number, MissionDefinition>;
  static catalogue_missions_by_code: Map<string, MissionDefinition>;
  static catalogue_missions_by_thematique: Map<Thematique, MissionDefinition[]>;

  constructor(private prisma: PrismaService) {
    MissionRepository.catalogue_missions_by_idcms = new Map();
    MissionRepository.catalogue_missions_by_thematique = new Map();
    MissionRepository.catalogue_missions_by_code = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.reloadMissions();
    } catch (error) {
      console.error(
        `Error loading missions definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  @Cron('* * * * *')
  public async reloadMissions() {
    const new_map_id: Map<number, MissionDefinition> = new Map();
    const new_map_code: Map<string, MissionDefinition> = new Map();
    const new_map_them: Map<Thematique, MissionDefinition[]> = new Map();
    const liste_missions = await this.prisma.mission.findMany();
    liste_missions.forEach((mission) => {
      const def = MissionRepository.buildMissionDefFromDB(mission);
      new_map_code.set(mission.code, def);
      new_map_id.set(mission.id_cms, def);
      const them_array = new_map_them.get(def.thematique);
      if (them_array) {
        them_array.push(def);
      } else {
        new_map_them.set(def.thematique, [def]);
      }
    });
    MissionRepository.catalogue_missions_by_code = new_map_code;
    MissionRepository.catalogue_missions_by_idcms = new_map_id;
    MissionRepository.catalogue_missions_by_thematique = new_map_them;
  }

  async upsert(missionDef: MissionDefinition): Promise<void> {
    const mission_db: Mission = {
      id_cms: missionDef.id_cms,
      thematique: missionDef.thematique,
      thematique_univers: missionDef.thematique_univers,
      titre: missionDef.titre,
      code: missionDef.code,
      image_url: missionDef.image_url,
      est_visible: missionDef.est_visible,
      objectifs: missionDef.objectifs as any,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.mission.upsert({
      where: { id_cms: missionDef.id_cms },
      create: {
        ...mission_db,
      },
      update: {
        ...mission_db,
      },
    });
  }
  async delete(content_id: number): Promise<void> {
    await this.prisma.mission.delete({
      where: { id_cms: content_id },
    });
  }

  getByThematiqueUnivers(thematiqueUnivers: string): MissionDefinition {
    for (const [key, value] of MissionRepository.catalogue_missions_by_idcms) {
      if (value.thematique_univers === thematiqueUnivers) return value;
    }
    return null;
  }

  getByCMS_ID(cms_id: number): MissionDefinition {
    return MissionRepository.catalogue_missions_by_idcms.get(cms_id);
  }
  getByThematique(thematique: Thematique): MissionDefinition[] {
    return MissionRepository.catalogue_missions_by_thematique.get(thematique);
  }

  list(): MissionDefinition[] {
    return Array.from(MissionRepository.catalogue_missions_by_idcms.values());
  }

  private static buildMissionDefFromDB(missionDB: Mission): MissionDefinition {
    if (missionDB === null) return null;
    return new MissionDefinition({
      id_cms: missionDB.id_cms,
      est_visible: missionDB.est_visible,
      thematique: Thematique[missionDB.thematique],
      thematique_univers: missionDB.thematique_univers,
      objectifs: missionDB.objectifs as any,
      code: missionDB.code,
      image_url: missionDB.image_url,
      titre: missionDB.titre,
    });
  }
}
