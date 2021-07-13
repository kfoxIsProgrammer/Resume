import {isNumberLike, formatDate} from './utils';
import * as timeValues from './timeValues';

export const PRIVATE_VALUE = 'private';
export const NO_CACHE_NO_STORE = 'no-cache, no-store, must-revalidate';

// TODO: add parser that can understand string input for header values
// ie: 'private, max-age=300

/**
 * If a number or number-like, return the value as a number
 * If a string, and it is in a the `timeValues` map, return that time value
 * @param {number|string|*} value
 * @return {number|string}
 */
function getTimeValue(value) {
    if (isNumberLike(value)) {
        return Number(value);
    } else if (typeof value === 'string') {
        // checks for values listed in ./timeValues
        value = value.toUpperCase();
        if (timeValues[value]) {
            return timeValues[value];
        }
    }
    // if no valid value, always return a number
    console.warn(`no cached value found. ${value} was passed in. returning 0`);
    return 0;
}

/**
 *
 * @param {boolean} setPrivate Used for user-specific pages
 * @returns {*}
 */
function generateBrowserCacheHeader(setPrivate) {
    if (setPrivate) {
        return `${PRIVATE_VALUE}, ${NO_CACHE_NO_STORE}`;
    }
    return NO_CACHE_NO_STORE;
}

/**
 * @param {string|number} maxAge
 * @returns {string}
 */
function generateMaxAgeHeader(maxAge) {
    return `max-age=${getTimeValue(maxAge)}`;
}

/**
 * @param {string|number} maxAge
 * @returns {string}
 */
function generateStaleRevalidateCacheHeader(maxAge) {
    return `stale-while-revalidate=${getTimeValue(maxAge)}`;
}

/**
 * @param {string|number} maxAge
 * @returns {string}
 */
function generateStaleError(maxAge) {
    return `stale-if-error=${getTimeValue(maxAge)}`;
}

/**
 * All options can use a string value. See {@link module:timeValues} for all available values
 * Returns the cache header name as the key for res.set()
 * @memberof module:cacheControl
 * @alias generate
 * @param {object} [options] Caching options
 * @param {number|string} [options.staleRevalidate=false] Time when to refresh the content in the background
 * @param {number|string} [options.staleIfError=false] Time to allow for serving cache when there is an error from a back-end service
 * @param {boolean} [options.setPrivate=false] use the `private` cache header value for user-specific pages
 * @returns {{Cache-Control: string}}
 */
function generateCacheControl(options) {
    const {
        staleRevalidate = false,
        staleError = false,
        // private should only be used for user-specific pages. ie account pages
        setPrivate = false } = options;
    const cacheHeaders = [generateBrowserCacheHeader(setPrivate)];

    if (typeof staleRevalidate !== 'boolean') {
        cacheHeaders.push(generateStaleRevalidateCacheHeader(staleRevalidate));
    }

    if (typeof staleError !== 'boolean') {
        cacheHeaders.push(generateStaleError(staleError));
    }

    return {
        'Cache-Control': `${cacheHeaders.join(', ')}`
    };
}

/**
 * Returns the cache header name as the key for res.set()
 * @param {object} options
 * @param {number|string} [options.maxAge=timeValues.TEN_MINUTES] The browser cache length
 * @param {boolean} [options.setPrivate=false] Set the max-age value to 0 for user-specific pages
 * @returns {{Surrogate-Control: string}}
 */
function generateSurrogateControl(options) {
    const {
        // private should only be used for user-specific pages. ie account pages
        setPrivate = false
    } = options;
    let { maxAge } = options;
    if (maxAge === undefined) {
        // only default this if maxAge is undefined
        // since 0 can be passed in
        maxAge = timeValues.TEN_MINUTES;
    }
    // always force time to 0 if setPrivate - usually user-specific content
    const time = setPrivate ? 0 : maxAge;

    return {
        'Surrogate-Control': generateMaxAgeHeader(time)
    };
}

function generatePragmaHeader() {
    return {
        'Pragma': 'no-cache'
    };
}

function generateExpiresHeader() {
    return {
        'Expires': 0
    };
}

function generateLastModifiedHeader(options) {
    let { lastModified = false } = options;
    const { setPrivate = false } = options;

    if (setPrivate) {
        lastModified = formatDate();
    }

    return lastModified ? { 'Last-Modified': lastModified } : {};
}

/**
 * @see `generateCacheControl`, `generateSurrogateControl`, and `generateLastModifiedHeader` for options
 * @param options
 * @returns {*[]}
 */
export function generateAllCacheHeaders(options = {}) {
    return Object.assign(
        {},
        generateCacheControl(options),
        generateSurrogateControl(options),
        generatePragmaHeader(),
        generateExpiresHeader(),
        generateLastModifiedHeader(options)
    );
}
