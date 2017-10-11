const Differencify = require('differencify');

const differencify = new Differencify();

describe('tests', () => {
  beforeAll(async () => {
    await differencify.launchBrowser();
  });
  afterAll(async () => {
    await differencify.cleanup();
  });
  it('google', async () => {
    const result = await differencify
      .init()
      .resize({ width: 1600, height: 1200 })
      .goto('http://www.google.com')
      .wait(3000)
      .capture()
      .close()
      .end();

    expect(result).toEqual(true);
  }, 20000);
  it('github', async () => {
    await differencify
      .init()
      .goto('http://www.github.com')
      .close()
      .end();
  }, 7000);
  it('msn', async () => {
    const page = await differencify.init({ chain: false });
    await page.goto('http://www.msn.com');
    await page.close();
  }, 7000);
});
