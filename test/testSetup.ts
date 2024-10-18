import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestUtil } from './TestUtil';

module.exports = async function (globalConfig, projectConfig) {
  // Set reference to mongod in order to close the server during teardown.
  globalThis.VAR = 'haha';
  /*
  if (!TestUtil.app) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    TestUtil.app = moduleFixture.createNestApplication();
    await TestUtil.app.init();
  }
    */
};
