<p align="center"><img alt="Differencify" src="images/logo.png" width="150">
<br>
<strong>Differencify</strong>
<br>
Regression Testing suite!
</p>
<br>

Status: [![CircleCI](https://circleci.com/gh/NimaSoroush/differencify/tree/master.svg?style=svg)](https://circleci.com/gh/NimaSoroush/differencify/tree/master)

## About
Differencify is a library for visual regression testing by comparing your local changes with reference screenshots of your website. It is built on top of chrome headless using [Puppeteer](https://github.com/GoogleChrome/puppeteer)

|Reference|Local changes|
|---------|-------------|
|<img alt="Differencify" src="images/reference_screenshot.png" width="400">|<img alt="Differencify" src="images/differencified_screenshot.png" width="400">|


## Requirements
- Node > 7.6.0
- Chrome > 59 or [Chrome Canary](https://www.google.co.uk/chrome/browser/canary.html)

## Installation
Install the module:
```bash
npm install differencify
```
## Usage
```js
import Differencify from 'differencify';
const differencify = new Differencify(GlobalOptions);
```

### Validate your changes
```js
(async () => {
  const result = await differencify
    .init()
    .resize({ width: 1600, height: 1200 })
    .goto('http://www.google.com')
    .wait(3000)
    .capture()
    .close()
    .end();
  
  // or unchained

  const page = await differencify.init({ chain: false });
  await page.resize({ width: 1600, height: 1200 });
  await page.goto('http://www.msn.com');
  await page.wait(3000);
  await page.capture();
  const result = await page.close();

  console.log(result); // Prints true or false
})();
```
<p align="center">
<img src="images/test.gif" width="500">
</p>

### Create/Update reference screenshots
Simply set environment variable `update=true` and run the same code.

<p align="center">
<img src="images/update.gif" width="500">
</p>

### API

See [API.md](API.md) for full list of API calls

### GlobalOptions

|Parameter|type|required|description|default|
|---------|----|--------|-----------|-------|
|`headless`|`boolean`|no|Browser is launched in visible mode|true|
|`debug`|`boolean`|no|Enables console output|false|
|`timeout`|`integer` (ms)|no|Maximum time in milliseconds to wait for the Chrome instance to start|30000|
|`screenshots`|`string`|no|Stores reference screenshots in this directory|./screenshots|
|`testReports`|`string`|no|Stores test screenshots in this directory|./differencify_report|
|`saveDifferencifiedImage`|`boolean`|no|Save differencified image to testReportPath in case of mismatch|true|
|`mismatchThreshold`|`integer`|no|Difference tolerance between reference/test image|0.01|
|`ignoreHTTPSErrors`|`boolean`|no|Whether to ignore HTTPS errors during navigation|false|
|`slowMo`|`integer`|no|Slows down browser operations by the specified amount of milliseconds|0|
|`browserArgs`|`Array`|no|Additional arguments to pass to the browser instance. List of Chromium flags can be found [here](http://peter.sh/experiments/chromium-command-line-switches/)|[]|
|`dumpio`|`boolean`|no|Whether to pipe browser process stdout and stderr into process.stdout and process.stderr|false|

### TestOptions

|Parameter|type|required|description|default|
|---------|----|--------|-----------|-------|
|`testName`|`string`|no|Unique name for your test case|test|
|`newWindow`|`boolean`|no|Whether to open test execution on new browser window or not. By default it opens on new tab|false|
|`chain`|`boolean`|no|Whether to chain differencify commands or not. More details on [examples](examples)|true|

### Steps API

See [API.md](API.md) for full list of Steps API calls


### Interested on Docker image!

A [Dockerfile](Dockerfile) with chrome-headless is available for local and CI usage

Build the container:

```docker build -t puppeteer-chrome-linux .```

Run the container by passing node -e "<yourscript.js content as a string> as the command:

```docker run -i --rm --name puppeteer-chrome puppeteer-chrome-linux node -e "`cat yourscript.js`"```


### Links

See [examples](examples) for usages and CI integration with jest

See [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute.
