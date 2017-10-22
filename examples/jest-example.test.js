import Differencify from 'differencify';

const differencify = new Differencify();

describe('tests differencify', () => {
  beforeAll(async () => {
    await differencify.launchBrowser();
  });
  afterAll(async () => {
    await differencify.cleanup();
  });
  it('validate github page appear correctly', async () => {
    await differencify
      .init()
      .resize({ width: 1600, height: 1200 })
      .goto('https://github.com/NimaSoroush/differencify')
      .wait(1000)
      .capture()
      .toMatchSnapshot()
      .close()
      .end();
  }, 40000);
});
