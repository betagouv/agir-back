import { TestUtil } from './TestUtil';

module.exports = async function (globalConfig, projectConfig) {
  console.log(globalThis.VAR);
  /*
  await TestUtil.app.close();
  await TestUtil.prisma.$disconnect();
  */
};
