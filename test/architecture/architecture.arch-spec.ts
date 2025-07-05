import 'tsarch/dist/jest';
import { filesOfProject } from 'tsarch';

describe('architecture', () => {
  jest.setTimeout(60000);

  it('common should not depend on modules', async () => {
    const rule = filesOfProject()
      .inFolder('src/common')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/modules');
    await expect(rule).toPassAsync();
  });

  it('domains should be cycle free', async () => {
    const rule = filesOfProject()
      .inFolder('src/modules')
      .should()
      .beFreeOfCycles();
    await expect(rule).toPassAsync();
  });

  it('service files should not depend on controller files', async () => {
    const rule = filesOfProject()
      .inFolder('src/modules')
      .matchingPattern('.service')
      .shouldNot()
      .dependOnFiles()
      .matchingPattern('.controller');
    await expect(rule).toPassAsync();
  });
  it('service files should not depend on controller files', async () => {
    const rule = filesOfProject()
      .inFolder('src/modules')
      .matchingPattern('.repository')
      .shouldNot()
      .dependOnFiles()
      .matchingPattern('.service')
      .matchingPattern('.controller');
    await expect(rule).toPassAsync();
  });
});
