<p align="center"><img alt="Differencify" src="http://i.imgur.com/D0Eapjx.png" width="150">
<br>
<strong>Differencify</strong>
<br>
Regression Testing suite!
</p>
<br>

## About

Differencify is library for visual regression testing by comparing your locall changes with reference screenshots of your website.

## Requirements
- Node > 6
- Chrome > 59 or [Chrome Canary](https://confluence.skyscannertools.net/display/DW/Shared+Cache+Client)

## Installation
Install the module:
```bash
npm install --save-dev differencify
```
## Usage
```js
import Differencify from 'differencify';
const differencify = new Differencify(GlobalOptions);
```
### Create reference screenshots
```js
async () => {
  const result = await differencify.update(TestOptions);
  console.log(result); //true if update succeded
}
```
### Validate your changes
```js
async () => {
  const result = await differencify.test(TestOptions);
  console.log(result); //true if test pass
}
```

### GlobalOptions

|Parameter|type|required|description|default|
|---------|----|--------|-----------|-------|
|`visible`|`bool`|no|Browser is launched in visible mode|false|
|`debug`|`bool`|no|Enables console output|false|
|`timeout`|`integer` (ms)|no|Global test timeout|30000|
|`screenshots`|`string`|no|Stores reference screenshots in this directory|./screenshots|
|`testReportPath`|`string`|no|Stores test screenshots in this directory|./differencify_report|
|`saveDifferencifiedImage`|`bool`|no|Save differencified image to testReportPath in case of mistmach|true|
|`mismatchThreshold`|`integer`|no|Difference tolerance between referenced/testsed image|0.01|

### TestOptions

|Parameter|type|required|description|default|
|---------|----|--------|-----------|-------|
|`name`|`string`|yes|Unique name for your test case|default|
|`resolution`|`object`|no|Browser width and height|800 * 600|
|`steps`|`object`|yes|Steps before capturing screenshot|null|

### Steps

|name|type|value|
|----|----|-----|
|`goto`|`string`|Url|
|`capture`|`string`|`undefiend`, `document` or selector name|

##### Coming steps
- wait
- click
- setCookie
- deleteCookie
- clearCookies
- emulate (Emulates phone)


### TestOptions example

```
{
  name: 'default',
  resolution: {
    width: 800,
    height: 600,
  },
  steps: [
    { name: 'goto', value: 'http://www.example.com' },
    { name: 'capture', value: 'document' },
  ],
}
```

### Interested on Docker image!

A [Dockerfile](Dockerfile) with chrome-headless is availale for local and CI usage


### Links

See [examples](examples) for usages and CI integration with jest

See [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute.
