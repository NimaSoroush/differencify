import path from 'path';
import fs from 'fs';
import Differencify from '../index';

const differencify = new Differencify({ debug: true });

describe('Differencify', () => {
  beforeAll(async () => {
    await differencify.launchBrowser({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  });
  afterAll(async () => {
    await differencify.cleanup();
  });
  it('simple', async () => {
    await differencify
      .init()
      .newPage()
      .setViewport({ width: 1600, height: 1200 })
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('simple unchained', async () => {
    const target = differencify.init({ chain: false });
    const page = await target.newPage();
    await page.goto(`file:${path.join(__dirname, 'example-website/example.htm')}`);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    expect(result).toEqual(true);
  }, 30000);
  it('Launch new browser per test', async () => {
    await differencify
      .init()
      .launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      .newPage()
      .setViewport({ width: 1600, height: 1200 })
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('Launch new browser per test when unchained', async () => {
    const target = differencify.init({ chain: false });
    await target.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await target.newPage();
    await page.goto(`file:${path.join(__dirname, 'example-website/example.htm')}`);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    await target.close();
    expect(result).toEqual(true);
  }, 30000);
  it('Using result function', async () => {
    await differencify
      .init()
      .newPage()
      .setViewport({ width: 1600, height: 1200 })
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .waitFor(1000)
      .title()
      .result((title) => {
        expect(title).toEqual('Example Domain');
      })
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('Using toMatchSnapshot callback for result details', async () => {
    await differencify
      .init()
      .newPage()
      .setViewport({ width: 1600, height: 1200 })
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .waitFor(1000)
      .title()
      .screenshot()
      .toMatchSnapshot((resultDetail) => {
        expect(resultDetail).toMatchObject({
          testConfig: {
            chain: true,
            imageType: 'png',
            isJest: true,
            isUpdate: false,
            testId: expect.any(Number),
            testName: 'Differencify Using toMatchSnapshot callback for result details',
            testNameProvided: false,
            testPath: expect.stringMatching(/differencify\/src\/integration\.tests\/integration\.test\.js/),
          },
          testResult: {
            diffPercent: 0,
            distance: 0,
            matched: true,
            snapshotPath: expect.stringMatching(/integration\.tests\/__image_snapshots__\/Differencify Using toMatchSnapshot callback for result details\.snap\.png/),
          },
        });
      })
      .close()
      .end();
  }, 30000);
  it('Using toMatchSnapshot callback for result details when unchained', async () => {
    const target = differencify.init({ chain: false });
    await target.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await target.newPage();
    await page.goto(`file:${path.join(__dirname, 'example-website/example.htm')}`);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    await target.toMatchSnapshot(image, (resultDetail) => {
      expect(resultDetail).toMatchObject({
        testConfig: {
          chain: false,
          imageType: undefined,
          isJest: true,
          isUpdate: false,
          newWindow: true,
          testId: expect.any(Number),
          testName: 'Differencify Using toMatchSnapshot callback for result details when unchained',
          testNameProvided: false,
          testPath: expect.stringMatching(/differencify\/src\/integration\.tests\/integration\.test\.js/),
        },
        testResult: {
          diffPercent: 0,
          distance: 0,
          matched: true,
          snapshotPath: expect.stringMatching(/integration\.tests\/__image_snapshots__\/Differencify Using toMatchSnapshot callback for result details when unchained\.snap\.png/),
        },
      });
    });
    await page.close();
    await target.close();
  }, 30000);
  it('Context switching when chained', async () => {
    await differencify
      .init()
      .newPage()
      .tracing
      .start({ path: 'trace.json' })
      .page
      .setViewport({ width: 1600, height: 1200 })
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .waitFor(1000)
      .keyboard
      .press('Space')
      .tracing
      .stop()
      .page
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('Calling Puppeteer specific functions when chained: console', async () => {
    await differencify
      .init()
      .newPage()
      .on('console', (msg) => {
        for (let i = 0; i < msg.args.length; i += 1) {
          expect(`${msg.args[i]}`).toEqual('JSHandle:hello');
        }
      })
      .evaluate(() => console.log('hello'))
      .close()
      .end();
  }, 30000);
  it('Calling Puppeteer specific functions when chained: dialog', async () => {
    await differencify
      .init()
      .newPage()
      .on('dialog', async (dialog) => {
        expect(dialog.message()).toEqual('1');
        await dialog.dismiss();
      })
      .evaluate(() => alert('1'))
      .close()
      .end();
  }, 30000);
  it('Continue on chained object', async () => {
    await differencify
      .init()
      .newPage()
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .mainFrame()
      .then
      .url()
      .result((url) => {
        expect(url).toEqual(`file://${path.join(__dirname, 'example-website/example.htm')}`);
      })
      .close()
      .end();
  }, 30000);
  it('Multiple toMatchSnapshot on chained object', async () => {
    await differencify
      .init()
      .newPage()
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .result((result) => {
        expect(result).toEqual(true);
      })
      .goto(`file:${path.join(__dirname, 'example-website/example.htm')}`)
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .result((result) => {
        expect(result).toEqual(true);
      })
      .close()
      .end();
  }, 30000);
  it('Multiple toMatchSnapshot when unchained', async () => {
    const target = differencify.init({ chain: false });
    const page = await target.newPage();
    await page.goto(`file:${path.join(__dirname, 'example-website/example.htm')}`);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.goto(`file:${path.join(__dirname, 'example-website/example.htm')}`);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image2 = await page.screenshot();
    const result2 = await target.toMatchSnapshot(image2);
    await page.close();
    expect(result).toEqual(true);
    expect(result2).toEqual(true);
  }, 30000);
  it('Custom test name', async () => {
    const target = differencify.init({
      testName: 'test1',
      chain: false,
    });
    const page = await target.newPage();
    await page.goto(`file:${path.join(__dirname, 'example-website/example.htm')}`);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    expect(result).toEqual(true);
  }, 30000);
  it('Custom test path', async () => {
    const customDifferencify = new Differencify({
      imageSnapshotPath: './src/integration.tests/__image_snapshots__/custom_test_path',
      debug: true,
    });
    await customDifferencify.launchBrowser({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const target = customDifferencify.init({
      chain: false,
    });
    const page = await target.newPage();
    await page.setViewport({ width: 1600, height: 1200 });
    await page.goto(`file:${path.join(__dirname, 'example-website/example.htm')}`);
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    await customDifferencify.cleanup();
    expect(result).toEqual(true);
  }, 30000);
  it('Freeze image in page', async () => {
    await differencify
      .init()
      .newPage()
      .setViewport({ width: 1600, height: 1200 })
      .goto(`file:${path.join(__dirname, 'example-website/animation.htm')}`)
      .waitFor('body > img')
      .freezeImage('body > img')
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('simple with mock requests', async () => {
    const contentHtml = fs.readFileSync(`${path.join(__dirname, 'example-website/example.htm')}`, 'utf8');
    await differencify
      .init()
      .newPage()
      .mockRequests()
      .setViewport({ width: 1600, height: 1200 })
      .setContent(contentHtml)
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('simple unchained with mock requests', async () => {
    const target = differencify.init({ chain: false });
    const page = await target.newPage();
    await target.mockRequests();
    const contentHtml = fs.readFileSync(`${path.join(__dirname, 'example-website/example.htm')}`, 'utf8');
    await page.setContent(contentHtml);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    expect(result).toEqual(true);
  }, 30000);
  it('simple with mock requests', async () => {
    const contentHtml = fs.readFileSync(`${path.join(__dirname, 'example-website/example.htm')}`, 'utf8');
    process.env.CI = 'true'; // This will simulate CI/CD environment
    await differencify
      .init()
      .newPage()
      .mockRequests()
      .setViewport({ width: 1600, height: 1200 })
      .setContent(contentHtml)
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('simple unchained with mock requests', async () => {
    process.env.CI = 'true'; // This will simulate CI/CD environment
    const target = differencify.init({ chain: false });
    const page = await target.newPage();
    await target.mockRequests();
    const contentHtml = fs.readFileSync(`${path.join(__dirname, 'example-website/example.htm')}`, 'utf8');
    await page.setContent(contentHtml);
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    expect(result).toEqual(true);
  }, 30000);
  it('mock requests and replace image', async () => {
    await differencify
      .init()
      .newPage()
      .mockRequests({ replaceImage: true })
      .setViewport({ width: 1600, height: 1200 })
      .goto('https://nimasoroush.github.io/differencify/')
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
  it('mock requests and replace image', async () => {
    process.env.CI = 'true'; // This will simulate CI/CD environment
    await differencify
      .init()
      .newPage()
      .mockRequests({ replaceImage: true })
      .setViewport({ width: 1600, height: 1200 })
      .goto('https://nimasoroush.github.io/differencify/')
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 30000);
});
