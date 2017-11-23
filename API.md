### Methods

|Method|Arguments|description|
|------|---------|-----------|
|`launchBrowser`|no argument|Launches a browser instance with [GlobalOptions](https://github.com/NimaSoroush/differencify#globaloptions). The browser will be closed when the parent node.js process is closed|
|`init`|[TestOptions](https://github.com/NimaSoroush/differencify#testoptions)|Launches a browser instance if there is no instance already been launched or launches new browser window if `newWindow:true`|
|`cleanup`|no argument|Closes browser instance if it is not closed already|

### Steps Methods

|name|type|value|
|----|----|-----|
|`goto`|`string`|Url|
|`click`|`string`|Selector|
|`wait`|`string`, `integer` or `func`|waiting time in millisecond `or` waiting for a selector `or` waiting until the function you supplied is evaluated as true|
|`execute`|`func` or `string`|execute an expression in the browser context|
|`freezeImage`|`string`|Selector name of a <img> tag containing animated image to be freezed before taking screenshot|
|`capture`|`object`|[screenshot options](https://github.com/NimaSoroush/differencify/blob/master/API.md#screenshot-options)|
|`resize`|`object`|[viewport](https://github.com/NimaSoroush/differencify/blob/master/API.md#viewport)|
|`toMatchSnapshot`|`null`|To support jest snapshot testing. This is not tested for other test frameworks|


#### screenshot options
- `options` <[Object]> Options object which might have the following properties:
    - `path` <[string]> The file path to save the image to. The screenshot type will be inferred from file extension. If `path` is a relative path, then it is resolved relative to [current working directory](https://nodejs.org/api/process.html#process_process_cwd). If no path is provided, the image won't be saved to the disk.
    - `type` <[string]> Specify screenshot type, can be either `jpeg` or `png`. Defaults to 'png'.
    - `quality` <[number]> The quality of the image, between 0-100. Not applicable to `png` images.
    - `fullPage` <[boolean]> When true, takes a screenshot of the full scrollable page. Defaults to `false`.
    - `clip` <[Object]> An object which specifies clipping region of the page. Should have the following fields:
        - `x` <[number]> x-coordinate of top-left corner of clip area
        - `y` <[number]> y-coordinate of top-left corner of clip area
        - `width` <[number]> width of clipping area
        - `height` <[number]> height of clipping area
    - `omitBackground` <[boolean]> Hides default white background and allows capturing screenshots with transparency. Defaults to `false`.

#### viewport
- `viewport` <[Object]>
  - `width` <[number]> page width in pixels.
  - `height` <[number]> page height in pixels.
  - `deviceScaleFactor` <[number]> Specify device scale factor (can be thought of as dpr). Defaults to `1`.
  - `isMobile` <[boolean]> Whether the `meta viewport` tag is taken into account. Defaults to `false`.
  - `hasTouch`<[boolean]> Specifies if viewport supports touch events. Defaults to `false`
  - `isLandscape` <[boolean]> Specifies if viewport is in landscape mode. Defaults to `false`.


##### Coming methods
- click
- setCookie
- deleteCookie
- emulate (Emulates phone)
- ...
