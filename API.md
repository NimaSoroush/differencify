## Differencify specific methods

|Method|Arguments|description|
|------|---------|-----------|
|`launchBrowser`/`launch`|`Object` [puppeteer.launch options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)|Launches a browser instance|
|`connect`|`Object` [puppeteer.connect options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions)|Attaches to an existing browser instance|
|`init`|[TestOptions](https://github.com/NimaSoroush/differencify#testoptions)|Launches a browser instance if there is no instance already been launched or launches new browser window if `newWindow:true`|
|`cleanup`|no argument|Closes browser instance if it is not closed already|

## Additional methods on top of Puppeteer's Page class

|Method|Arguments|description|
|------|---------|-----------|
|`freezeImage`|`string`|Selector name of a <img> tag containing animated image to be freezed before taking screenshot|
|`toMatchSnapshot`|no argument|To support jest snapshot testing. This is not tested for other test frameworks|
|`result`|`Object`|A function that returns response object of previous step|
|`launch`|`Object` [puppeteer.launch options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)|launches new browser before opening new tab|
|`connect`|`Object` [puppeteer.connect options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions)|Attaches to an existing browser instance before opening new tab|

## Puppeteer methods

Differencify matches [Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)'s API completely. Here are some examples

## Simple

```js
(async () => {
  await differencify.launchBrowser();
  await differencify
    .init()
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .wait(3000)
    .screenshot()
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
  const page = await differencify.init({ chain: false }).newPage();
  await page.setViewport({ width: 1600, height: 1200 });
  await page.goto('https://github.com/NimaSoroush/differencify');
  await page.wait(3000);
  await page.screenshot();
  result = await page.close();
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
    .wait(3000)
    .screenshot()
    .close()
    .end();
})();
```
In this example, differencify will launch a browser instance and continues on others steps and on `close()` it will close both page and browser

## Share browser per test

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
    .close()
    .end();

  await differencify
    .init({ testName: 'test2' })
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .wait(3000)
    .screenshot()
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
    .launch()
    .newPage()
    .setViewport({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .title()
    .result((tittle) => {
      console.log(tittle)
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
    .launch()
    .newPage()
    .tracing
      .start({path: 'trace.json'})
    .page
      .goto('https://github.com/NimaSoroush/differencify')
      .wait(1000)
    .mouse
      .click(120, 240)
    .tracing
      .stop({path: 'trace.json'})
    .page
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
    .launch()
    .newPage()
    .on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
      console.log(`${i}: ${msg.args[i]}`);
    });
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

## Continue on chained object

```js
(async () => {
  await differencify
    .launch()
    .newPage()
    .goto('https://github.com/NimaSoroush/differencify')
    .mainFrame()
      .then
      .childFrames()
      .then
      .url()
      .result((url) => {
        console.log(url)
      })
    .close()
    .end();
})();
```
In this example, differencify will get the `mainFrame` of page and continues by `then` to get `childFrame` of that frame and finally prints the `url` of the childFrame.



