## Differencify specific methods

|Method|Arguments|description|
|------|---------|-----------|
|`launchBrowser`/`launch`|`Object` [puppeteer.launch options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)|Launches a browser instance|
|`connectBrowser`/`connect`|`Object` [puppeteer.connect options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions)|Attaches to an existing browser instance|
|`init`|[TestOptions](https://github.com/NimaSoroush/differencify#testoptions)|Configure and prepare differencify to operate based on `TestOptions`|
|`cleanup`|no argument|Closes browser instance if it is not closed already|

## Additional methods on top of Puppeteer's Page class

|Method|Arguments|description|
|------|---------|-----------|
|`toMatchSnapshot`|no argument|It matches the captured screenshot with reference screenshot|
|`result`|`Object`|A function that returns response object of previous step when on chained mode|
|`launch`|`Object` [puppeteer.launch options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)|launches new browser and returns browser object|
|`connect`|`Object` [puppeteer.connect options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions)|Attaches to an existing browser instance and returns browser object|
|`freezeImage`|`string`|Selector name of a `<img>` tag containing animated image to be freezed before taking screenshot|

## Puppeteer methods

Differencify matches [Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)'s API completely. Here are some examples of how to use it.

## Simple

```js
(async () => {
  await differencify.launchBrowser();
  await differencify
    .init()
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .waitFor(1000)
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result) // True or False
    })
    .close()
    .end();
  await differencify.cleanup();
})();
```
In this example, differencify will launch a browser instance and continues on others steps

## Simple unchained

```js
(async () => {
  await differencify.launchBrowser();
  const target = differencify.init({ testName: 'Differencify simple unchained', chain: false });
  const page = await target.newPage();
  await page.goto('https://github.com/NimaSoroush/differencify');
  await page.setViewport({ width: 1600, height: 1200 });
  await page.waitFor(1000);
  const image = await page.screenshot();
  const result = await target.toMatchSnapshot(image);
  await page.close();
  console.log(result) // True or False
  await differencify.cleanup();
})();
```
In this example, differencify will launch a browser instance and unchain steps. `differencify.init().newPage()` will return a `puppeteer` page instance which with all supported methods on that [page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page)

## Launch new browser per test

```js
(async () => {
  await differencify
    .init()
    .launch()
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .waitFor(1000)
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result) // True or False
    })
    .close()
    .end();
})();
```
In this example, differencify will launch a browser instance and continues on others steps and on `close()` it will close both page and browser

## Launch new browser per test when unchained

```js
(async () => {
  const target = differencify.init({ testName: 'Differencify simple unchained', chain: false });
  await target.launch();
  const page = await target.newPage();
  await page.goto('https://github.com/NimaSoroush/differencify');
  await page.setViewport({ width: 1600, height: 1200 });
  await page.waitFor(1000);
  const image = await page.screenshot();
  const result = await target.toMatchSnapshot(image);
  await page.close();
  await target.close();
  console.log(result) // True or False
})();
```
In this example, differencify will launch a browser instance and unchain steps. `differencify.init().newPage()` will return a `puppeteer` page instance which with all supported methods on that [page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page)

## Share browser

```js
(async () => {
  await differencify.launchBrowser();
  await differencify
    .init({ testName: 'test1' })
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .wait(3000)
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result) // True or False
    })
    .close()
    .end();

  await differencify
    .init({ testName: 'test2' })
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .wait(3000)
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result) // True or False
    })
    .close()
    .end();
  
  await differencify.cleanup();
})();
```
In this example, differencify will launch a browser instance and share same browser instance with all following tests and on `cleanup()` it will close the browser


## Using result function

```js
(async () => {
  await differencify
    .init()
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .title()
    .result((tittle) => {
      console.log(tittle)
    })
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result) // True or False
    })
    .close()
    .end();
})();
```
In this example, after calling `result` function it will return the previous step result as an object.


## Context switching when chained

```js
(async () => {
  await differencify
    .init()
    .newPage()
    .tracing
      .start({ path: 'trace.json' })
    .page
      .setViewport({ width: 1600, height: 1200 })
      .goto('https://nimasoroush.github.io/differencify/')
      .waitFor(1000)
    .keyboard
      .press('Space')
    .tracing
      .stop()
    .page
      .screenshot()
      .toMatchSnapshot()
      .result((result) => {
        console.log(result) // True or False
      })
      .close()
      .end();
})();
```
In this example, differencify will launch a browser instance and opens a new tab and starts tracing, goto url, mouse click, stop tracing and finally closes the tab. All steps are running on `page` context unless you switch to one of the following context:

```
  'page',
  'keyboard',
  'mouse',
  'touchscreen',
  'tracing',
```

If you do so, you need to come back to `page` context by calling it.


## Calling Puppeteer's specific functions when chained

```js
(async () => {
  await differencify
    .init()
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://nimasoroush.github.io/differencify/')
    .on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i) {
        console.log(`${i}: ${msg.args[i]}`); // JSHandle:hello
      }
    });
    .evaluate(() => console.log('hello', 5, { foo: 'bar' }))
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result) // True or False
    })
    .close()
    .end();
})();
```
In this example, differencify will call `on()` method of Puppeteer asynchronously. same logic should apply for other specific methods of Puppeteer like:

```js
on('dialog', async dialog => { console.log(dialog.message()) };
evaluate(() => console.log('hello', 5, {foo: 'bar'}));
$$eval('div', divs => divs.length);
evaluateHandle(() => document.body);
...
```
Another example
```js

(async () => {
  await differencify
    .init()
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://nimasoroush.github.io/differencify/')
    .on('dialog', async (dialog) => {
      console.log(dialog.message()); // 1
      await dialog.dismiss();
    })
    .evaluate(() => alert('1'))
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result) // True or False
    })
    .close()
    .end();
})();
```

## Continue on chained object

```js
(async () => {
  await differencify
    .init()
    .newPage()
    .goto('https://github.com/NimaSoroush/differencify')
    .mainFrame()
      .then
      .url()
      .result((url) => {
        console.log(url); // https://github.com/NimaSoroush/differencify
      })
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result); // True or False
    })
    .close()
    .end();
})();
```
In this example, differencify will get the `mainFrame` of page and continues by `then` to get `childFrame` of that frame and finally prints the `url` of the childFrame.

## Multiple toMatchSnapshot on chained object

```js
(async () => {
  await differencify
    .init()
    .newPage()
    .goto('https://nimasoroush.github.io/differencify/')
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result); // True or False
    })
    .goto('https://nimasoroush.github.io/differencify/')
    .screenshot()
    .toMatchSnapshot()
    .result((result) => {
      console.log(result); // True or False
    })
    .close()
    .end();
})();
```
In this example, differencify will got to different pages and compare screenshots with reference screenshots.

## Multiple toMatchSnapshot when unchained

```js
(async () => {
  const target = differencify.init({ chain: false });
  const page = await target.newPage();
  await page.goto('https://nimasoroush.github.io/differencify/');
  await page.setViewport({ width: 1600, height: 1200 });
  await page.waitFor(1000);
  const image = await page.screenshot();
  const result = await target.toMatchSnapshot(image);
  await page.goto('https://github.com/NimaSoroush/differencify#about');
  await page.setViewport({ width: 1600, height: 1200 });
  await page.waitFor(1000);
  const image2 = await page.screenshot();
  const result2 = await target.toMatchSnapshot(image2);
  await page.close();
  console.log(result); // True or False
  console.log(result2); // True or False
})();
```
In this example, differencify will got to different pages and compare screenshots with reference screenshots.

## Custom test path

```js
(async () => {
  const differencify = new Differencify({ imageSnapshotPath: './custom_test_path' });
  const target = differencify.init({ chain: false });
  await target.launch();
  const page = await target.newPage();
  await page.setViewport({ width: 1600, height: 1200 });
  await page.goto('http://example.com/');
  await page.waitFor(1000);
  const image = await page.screenshot();
  const result = await target.toMatchSnapshot(image);
  await page.close();
  console.log(result); // True or False
  console.log(result2); // True or False
})();
```
In this example, you can specify the custom path for storing images.




