import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/infrastructure/db/prisma.service";

let app: INestApplication;
const prisma = new PrismaService();

async function appinit() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    return app;
}

async function appclose() {
    await app.close();
    await prisma.$disconnect()
}
function db() {
    return prisma
}

module.exports = { appinit, appclose, db, prisma};