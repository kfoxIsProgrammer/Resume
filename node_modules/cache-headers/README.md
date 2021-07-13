# Cache Headers

Create cache headers as application-level or route-level middleware. This has only been tested as middleware for an express app.
The primary cache header set is the `Cache-Control` header value. All time values are set as seconds per the [w3 spec][spec].

This package is developed using [ES6][es6-moz] and transpiled with [babel]. It is also using the [1stdibs eslint rules][eslint-rules].

## Installation

```sh
$ yarn add cache-headers
// with npm 
$ npm install --save cache-headers
```

## Tests
```sh
$ yarn
$ yarn test
// with npm
$ npm install
$ npm test
```

## Usage

### App-level setup middleware

```es6
const express = require('express');
const app = express();
const cache = require('cache-headers');
const pathsConfig = {
    paths: {
        '/**/generic': {
            staleRevalidate: 'ONE_HOUR',
            staleError: 'ONE_HOUR'
        },
        '/default/values': {},
        '/user/route': false,
        '/**': 60
    }
};

// some other middleware

app.use(cache.setupInitialCacheHeaders(pathsConfig));

// rest of app setup
```
With the example above, the `Cache-Control` header is set as follows when a user hits these different site routes:
- `/**/generic` (any route ending in `generic`)
    - `Cache-Control: no-cache, no-store, must-revalidate, stale-while-revalidate=3600, stale-if-error=3600`
    - `Surrogate-Control: maxAge=600`
- `/default/values`
    - `Cache-Control: no-cache, no-store, must-revalidate`
    - `Surrogate-Control: maxAge=600`
- `/user/route`
    - `Cache-Control: private, no-cache, no-store, must-revalidate`
    - `Surrogate-Control: maxAge=0`
    - `Last-Modified: (NOW)`
- `/**` (any other route not listed)
    - `Cache-Control: no-cache, no-store, must-revalidate`
    - `Surrogate-Control: maxAge=60`

### Router-level middleware

Taking the app-level setup above, you can additionally override the default `pathsConfig` initially set.
```es6
const express = require('express');
const router = express.Router();
const cache = require('cache-headers');
const overrideConfig = {
    "maxAge": 2000
};

// app.use(cache.setupInitialCacheHeaders(pathsConfig)) is loaded prior to this route, therefore running by default
// and any subsequent call to set the header is then overwritten

router.get('/endswith/generic', cache.overrideCacheHeaders(overrideConfig), (req, res, next) => {
    // do route-y stuff
    next();
});

```

Rather than set the original headers defined in the `pathsConfig` config in the app-level setup (for the `/**/generic` path), this will output the following:
```
Cache-Control: no-cache, no-store, must-revalidate
Surrogate-Control: maxAge=2000
```

## API

### `cache.setupInitialCacheHeaders(pathsConfig)`
```js
{
    '/glob/**/path': object|string|boolean=false
}
```
The following are acceptable keys to use if an object is passed in

| key | type | description | default |
| --- | ---- | ----------- | ------- |
| `lastModified` | string | set `Last-Modified Header` | |
| `maxAge` | string, number | number or string representing a number for `Surrogate-Control: max-age` (forced to `0` if `setPrivate=true`) | `TEN_MINUTES` (600 seconds) |
| `setPrivate` | boolean | should add `Cache-Control: private` (if set to `true` forces `Surrogate-Control: maxAge=0` and `Last-Modified: (NOW)`) | false |
| `staleError` | string, number | number or string representing a number for `Cache-Control: stale-if-error` |  |
| `staleRevalidate` | string, number | number or string representing a number for `Cache-Control: stale-while-revalidate` |  |

The following are acceptable values to use if a string is passed in for cache values:

- `'ONE_MINUTE'`
- `'TEN_MINUTES'`
- `'ONE_HOUR'`
- `'ONE_DAY'`
- `'ONE_WEEK'`
- `'ONE_MONTH'`
- `'ONE_YEAR'`

The following are acceptable values to use if a boolean is passed in 

- `false` - this is equivalent to passing `{ setPrivate: true, maxAge: 0 }` 

If no options are passed in, the default value set is
 ```
 Cache-Control: no-cache, no-store, must-revalidate
 Surrogate-Control: max-age=600
 ```

### `cache.overrideCacheHeaders(overrideConfig)`
```js
{
    lastModified: string,
    maxAge: number|string,
    setPrivate: boolean,
    staleError: number|string,
    staleRevalidate: number|string
}
```
| key | type | description | default |
| --- | ---- | ----------- | ------- |
| `lastModified` | string | set `Last-Modified Header` | |
| `maxAge` | string, number | number or string representing a number for `Surrogate-Control: max-age` (forced to `0` if `setPrivate=true`) | `TEN_MINUTES` (600 seconds) |
| `setPrivate` | boolean | should add `Cache-Control: private` (if set to `true` forces `Surrogate-Control: maxAge=0` and `Last-Modified: (NOW)`) | false |
| `staleError` | string, number | number or string representing a number for `Cache-Control: stale-if-error` |  |
| `staleRevalidate` | string, number | number or string representing a number for `Cache-Control: stale-while-revalidate` |  |

## Recipes
#### Private Pages
Options for pages that are intended for a single user and should not be cached. 
```js
{
    setPrivate: true    
}
```
Headers Output: 
```
'Cache-Control': 'private, no-cache, no-store, must-revalidate'
'Surrogate-Control': 'maxAge=0'
'Pragma': 'no-cache'
'Expires': 0
'Last-Modified': (NOW)
```

#### Browser/Server Cached Pages
Options for pages that are intended for all users and should be cached in both the browser and the server. 
```js
{
    maxAge: 'ONE_WEEK',                             // cache on server
    staleError: 'ONE_MONTH',                        // cache on browser if server returns error
    staleRevalidate: 'TEN_MINUTES',                 // cache on browser for 10 min
    lastModified: 'Fri, 23 Jun 2017 14:35:44 GMT'   // some deployTime from a versionReport
}
```
Headers Output: 
```
'Cache-Control': 'no-cache, no-store, must-revalidate, stale-while-revalidate=600, stale-if-error=2592000'
'Surrogate-Control': 'maxAge=604800'
'Pragma': 'no-cache'
'Expires': 0
'Last-Modified': 'Fri, 23 Jun 2017 14:35:44 GMT'
```

## Additional notes on header use / specification 
- `Cache-Control`
    - `private` - response intended for single user and should not be cached
    - `no-cache, no-store, must-revalidate` - turns off browser caching
    - `stale-while-revalidate={seconds}` - use stale version for up to `{seconds}` while re-fetching latest version background
    - `stale-if-error={seconds}` - use stale version if re-fetch fails within `{seconds}` of response becoming stale
- `Surrogate-Control`
    -  takes priority over `Cache-Control`, but is stripped so browsers don't see it
    - `max-age={seconds}` - how long the response can be considered fresh

*(For more information on `Surrogate-Control`/`Cache-Control` headers read [Fastly Cache Control Tutorials](https://docs.fastly.com/guides/tutorials/cache-control-tutorial) and [W3 Specification](https://www.w3.org/TR/edge-arch/).)*

## Contributing
All code additions and bugfixes must be accompanied by unit tests. Tests are run with jest and
written with the node [`assert`][assert] module.

## Acknowledgement
A portion of this code was taken from this [cache-control][cache-control] package/repo.



[eslint-rules]: https://github.com/1stdibs/eslint-config-1stdibs
[babel]: https://babeljs.io/
[es6-moz]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
[spec]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9.3
[cache-control]: https://github.com/divshot/cache-control
[assert]: https://nodejs.org/api/assert.html
