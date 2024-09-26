import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mission } from '@prisma/client';
import { MissionDefinition } from '../../../src/domain/mission/missionDefinition';
import { ThematiqueRepository } from './thematique.repository';

@Injectable()
export class MissionRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(missionDef: MissionDefinition): Promise<void> {
    const mission_db: Mission = {
      id_cms: missionDef.id_cms,
      thematique_univers: missionDef.thematique_univers,
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

  async getByThematique(thematiqueUnivers: string): Promise<MissionDefinition> {
    const result = await this.prisma.mission.findUnique({
      where: { thematique_univers: thematiqueUnivers },
    });
    return this.buildMissionDefFromDB(result);
  }

  async getByCMS_ID(cms_id: number): Promise<MissionDefinition> {
    const result = await this.prisma.mission.findUnique({
      where: { id_cms: cms_id },
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
      thematique_univers: missionDB.thematique_univers,
      objectifs: missionDB.objectifs as any,
      univers: ThematiqueRepository.getUniversParent(
        missionDB.thematique_univers,
      ),
    });
  }
}
