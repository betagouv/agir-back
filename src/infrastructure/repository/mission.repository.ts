import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mission } from '@prisma/client';
import { Univers } from '../../domain/univers/univers';
import { MissionDefinition } from '../../../src/domain/mission/missionDefinition';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';

@Injectable()
export class MissionRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(missionDef: MissionDefinition): Promise<void> {
    const mission_db: Mission = {
      id_cms: missionDef.id_cms,
      thematique_univers: missionDef.thematique_univers,
      prochaines_thematiques: missionDef.prochaines_thematiques,
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

  async getByContentId(content_id: number): Promise<MissionDefinition> {
    const result = await this.prisma.mission.findUnique({
      where: { id_cms: content_id },
    });
    return this.buildMissionDefFromDB(result);
  }

  async list(): Promise<MissionDefinition[]> {
    const result = await this.prisma.mission.findMany();
    return result.map((elem) => this.buildMissionDefFromDB(elem));
  }

  private buildMissionDefFromDB(missionDB: Mission): MissionDefinition {
    if (missionDB === null) return null;
    return new MissionDefinition({
      id_cms: missionDB.id_cms,
      est_visible: missionDB.est_visible,
      prochaines_thematiques: missionDB.prochaines_thematiques.map(
        (t) => ThematiqueUnivers[t],
      ),
      thematique_univers: ThematiqueUnivers[missionDB.thematique_univers],
      objectifs: missionDB.objectifs as any,
    });
  }
}
