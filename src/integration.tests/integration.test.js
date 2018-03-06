import fs from 'fs';
import path from 'path';
import Differencify from '../index';
import Reporter from '../reporter';

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
      .goto('http://example.com/')
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 20000);
  it('simple unchained', async () => {
    const target = differencify.init({ chain: false });
    const page = await target.newPage();
    await page.goto('http://example.com/');
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    expect(result).toEqual(true);
  }, 20000);
  it('Launch new browser per test', async () => {
    await differencify
      .init()
      .launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      .newPage()
      .setViewport({ width: 1600, height: 1200 })
      .goto('http://example.com/')
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 20000);
  it('Launch new browser per test when unchained', async () => {
    const target = differencify.init({ chain: false });
    await target.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await target.newPage();
    await page.goto('http://example.com/');
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.close();
    await target.close();
    expect(result).toEqual(true);
  }, 20000);
  it('Using result function', async () => {
    await differencify
      .init()
      .newPage()
      .setViewport({ width: 1600, height: 1200 })
      .goto('http://example.com/')
      .waitFor(1000)
      .title()
      .result((tittle) => {
        expect(tittle).toEqual('Example Domain');
      })
      .screenshot()
      .toMatchSnapshot()
      .close()
      .end();
  }, 20000);
  it('Context switching when chained', async () => {
    await differencify
      .init()
      .newPage()
      .tracing
        .start({ path: 'trace.json' })
      .page
        .setViewport({ width: 1600, height: 1200 })
        .goto('http://example.com/')
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
  }, 20000);
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
  }, 20000);
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
  }, 20000);
  it('Continue on chained object', async () => {
    await differencify
      .init()
      .newPage()
      .goto('http://example.com/')
      .mainFrame()
        .then
        .url()
        .result((url) => {
          expect(url).toEqual('http://example.com/');
        })
      .close()
      .end();
  }, 20000);
  it('Multiple toMatchSnapshot on chained object', async () => {
    await differencify
      .init()
      .newPage()
      .goto('http://example.com/')
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .result((result) => {
        expect(result).toEqual(true);
      })
      .goto('http://example.com/')
      .waitFor(1000)
      .screenshot()
      .toMatchSnapshot()
      .result((result) => {
        expect(result).toEqual(true);
      })
      .close()
      .end();
  }, 20000);
  it('Multiple toMatchSnapshot when unchained', async () => {
    const target = differencify.init({ chain: false });
    const page = await target.newPage();
    await page.goto('http://example.com/');
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image = await page.screenshot();
    const result = await target.toMatchSnapshot(image);
    await page.goto('http://example.net/');
    await page.setViewport({ width: 1600, height: 1200 });
    await page.waitFor(1000);
    const image2 = await page.screenshot();
    const result2 = await target.toMatchSnapshot(image2);
    await page.close();
    expect(result).toEqual(true);
    expect(result2).toEqual(true);
  }, 20000);
  it('Save jest custom report to disk', () => {
    // Unfortunately this test is dependant on snapshot files existing from previous tests.
    // If previous test names change, we'll need to update these results.
    const aggregatedResults = {
      testResults: [
        {
          testFilePath: __filename,
          testResults: [
            {
              fullName: 'Differencify simple',
              status: 'fail',
            },
            {
              fullName: 'Differencify simple unchained',
              status: 'passed',
            },
          ],
          sourceMaps: {},
          skipped: false,
        },
      ],
      wasInterrupted: false,
    };
    const reporter = new Reporter();
    reporter.onRunComplete({}, aggregatedResults);
    expect(fs.existsSync(path.resolve('./differencify_reports/index.html'))).toEqual(true);
    expect(fs.existsSync(path.resolve('./differencify_reports/index.json'))).toEqual(true);
  }, 20000);
});
