import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/db/prisma.service';
const request = require('supertest');

export class TestUtil {
  constructor() {}
  public static app: INestApplication;
  public static prisma = new PrismaService();
  public static utilisateur = 'utilisateur';
  public static suivi = 'suivi';

  static getServer() {
    return request(this.app.getHttpServer());
  }

  static async appinit() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
    return this.app;
  }
  static async appclose() {
    await this.app.close();
    await this.prisma.$disconnect();
  }

  static async deleteAll() {
    await this.prisma.suivi.deleteMany();
    await this.prisma.interaction.deleteMany();
    await this.prisma.compteur.deleteMany();
    await this.prisma.badge.deleteMany();
    await this.prisma.dashboard.deleteMany();
    await this.prisma.quizzQuestion.deleteMany();
    await this.prisma.quizz.deleteMany();
    await this.prisma.empreinte.deleteMany();
    await this.prisma.utilisateur.deleteMany();
  }

  static async create(type: string, override?) {
    await this.prisma[type].create({
      data: this[type.concat('Data')](override),
    });
  }
  private static suiviData(override?) {
    return {
      id: 'suivi-id',
      type: 'alimentation',
      attributs: ['a', 'b', 'c'],
      valeurs: ['1', '2', '3'],
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  private static utilisateurData(override?) {
    return {
      id: 'utilisateur-id',
      name: 'name',
      ...override,
    };
  }
}
