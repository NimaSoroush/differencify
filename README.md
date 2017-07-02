<p align="center"><img alt="Differencify" src="http://i.imgur.com/D0Eapjx.png" width="150">
<br>
<strong>Differencify</strong>
<br>
Regression Testing suite!
</p>
<br>

[![CircleCI](https://circleci.com/gh/NimaSoroush/differencify.svg?style=svg)](https://circleci.com/gh/NimaSoroush/differencify)

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
### Code
```js
import Differencify from 'differencify';

async () => {
  const differencify = new Differencify([,GlobalOptions]);
  await differencify.test([,TestOptions]);
}
```

### GlobalOptions

|Parameter|type|required|description|default|
|---------|----|--------|-----------|-------|
|`visible`|`bool`|no|Browser is launched in visible mode|false|
|`debug`|`bool`|no|Enables console output|false|
|`timeout`|`integer` (ms)|no|Global test timeout|30000|
|`screenshots`|`string`|no|Stores reference screenshots in this directory|./screenshots|

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
|`capture`|`string`|`document` or selector name|

### TestOptions example

```
{
  name: 'default',
  resolution: {
    width: 800,
    height: 600,
  },
  steps: [
    { name: 'goto', value: 'www.example.com' },
    { name: 'capture', value: 'document' },
  ],
}
```

See [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute.
