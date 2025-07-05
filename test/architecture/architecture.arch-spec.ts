import 'tsarch/dist/jest';
import { filesOfProject } from 'tsarch';

describe('architecture', () => {
  jest.setTimeout(60000);

  it('common should not depend on domains', async () => {
    const rule = filesOfProject()
      .inFolder('src/common')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/domains');
    await expect(rule).toPassAsync();
  });

  it('domains should be cycle free', async () => {
    const rule = filesOfProject()
      .inFolder('src/domains')
      .should()
      .beFreeOfCycles();
    await expect(rule).toPassAsync();
  });
});
