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
|`capture`|`string`|`undefiend`, `document` or selector name|

##### Coming steps
- click
- setCookie
- deleteCookie
- clearCookies
- emulate (Emulates phone)
