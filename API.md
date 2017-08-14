### Methods

|Method|Arguments|description|
|------|---------|-----------|
|`update`|[TestOptions](https://github.com/NimaSoroush/differencify#testoptions)|Creates reference screenshots|
|`test`|[TestOptions](https://github.com/NimaSoroush/differencify#testoptions)|Validate your changes by testing against reference screenshots|
|`cleanup`|no argument|Closes all leftover browser instances|

### Steps Methods

|name|type|value|
|----|----|-----|
|`goto`|`string`|Url|
|`wait`|`string`, `integer` or `func`|waiting time in millisecond `or` waiting for a selector `or` waiting until the function you supplied is evaluated as true|
|`execute`|`func` or `string`|execute an expression in the browser context|
|`freezeImage`|`string`|Selector name of a <img> tag containing animated image to be freezed before taking screenshot|
|`capture`|`string`|`undefiend`, `document` or selector name|

#### Steps example

```
{
  ...
  steps: [
    { name: 'goto', value: 'http://www.example.com' },
    { name: 'wait', value: 5000 },
    { name: 'freezeImage', value: '#myImage' },
    { name: 'execute', value: () => { alert("Hello! I am an alert box!!") } },
    { name: 'capture', value: 'document' },
  ],
  ...
}
```

##### Coming steps
- click
- setCookie
- deleteCookie
- clearCookies
- emulate (Emulates phone)
