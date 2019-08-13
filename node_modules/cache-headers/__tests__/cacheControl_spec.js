import assert from 'assert';
import * as timeValues from '../src/timeValues';
import { formatDate } from '../src/utils';
import {generateAllCacheHeaders, NO_CACHE_NO_STORE} from '../src/cacheControl';
import {
    KEY_LAST_MODIFIED,
    KEY_STALE_IF_ERROR,
    KEY_STALE_WHILE_REVALIDATE,
    KEY_SURROGATE_CONTROL
} from '../src/headerTypes';

let now;
let staticHeaders;
let lastModifiedHeader;

// const now = formatDate(new Date('2001-01-01'));
const CACHE_CONTROL_STR = 'Cache-Control';
const SURROGATE_CONTROL_STR = 'Surrogate-Control';

describe('cache control', function () {

    function createOptions(options) {
        return Object.assign({}, options, lastModifiedHeader);
    }

    function headerAssertions(actual, expect) {
        expect = Object.assign({}, staticHeaders, expect);
        assert.deepEqual(actual, expect);
    }

    beforeEach(() => {
        now = formatDate(new Date('2001-01-01'));
        staticHeaders = {
            Expires: 0,
            Pragma: 'no-cache'
        };
        lastModifiedHeader = {
            [KEY_LAST_MODIFIED]: now
        };
    });

    it('should give all default values when no options are passed in', function () {
        const actual = generateAllCacheHeaders();
        const expect = {
            [CACHE_CONTROL_STR]: NO_CACHE_NO_STORE,
            [SURROGATE_CONTROL_STR]: 'max-age=600'
        };
        headerAssertions(actual, expect);
    });

    it('should set correct default cache control headers', function () {
        const actual = generateAllCacheHeaders(lastModifiedHeader);
        const expect = {
            [CACHE_CONTROL_STR]: NO_CACHE_NO_STORE,
            [SURROGATE_CONTROL_STR]: 'max-age=600',
            'Last-Modified': now
        };
        headerAssertions(actual, expect);
    });
    it('should set all headers passed in along with default max-age header not passed in', function () {
        const actual = generateAllCacheHeaders(createOptions({
            [KEY_STALE_WHILE_REVALIDATE]: 200,
            [KEY_STALE_IF_ERROR]: 300
        }));
        const expect = {
            [CACHE_CONTROL_STR]: `${NO_CACHE_NO_STORE}, stale-while-revalidate=200, stale-if-error=300`,
            [SURROGATE_CONTROL_STR]: 'max-age=600',
            'Last-Modified': now
        };
        headerAssertions(actual, expect);
    });
    it('should set all headers passed in defined with string keywords and numbers', function () {
        const actual = generateAllCacheHeaders(createOptions({
            [KEY_STALE_WHILE_REVALIDATE]: 'ONE_MINUTE',
            [KEY_STALE_IF_ERROR]: 10
        }));
        const expect = {
            [CACHE_CONTROL_STR]: `${NO_CACHE_NO_STORE}, stale-while-revalidate=60, stale-if-error=10`,
            [SURROGATE_CONTROL_STR]: 'max-age=600',
            'Last-Modified': now
        };
        headerAssertions(actual, expect);
    });
    it('should add `private` cache-control and set surrogate-control max-age to 0 when set to private', function () {
        const actual = generateAllCacheHeaders(createOptions({
            setPrivate: true,
            [KEY_SURROGATE_CONTROL]: timeValues.ONE_DAY
        }));
        const expect = {
            [CACHE_CONTROL_STR]: `private, ${NO_CACHE_NO_STORE}`,
            [SURROGATE_CONTROL_STR]: 'max-age=0',
            'Last-Modified': now
        };
        headerAssertions(actual, expect);
    });
    it('should properly case the string value and return the correct time', function () {
        const actual = generateAllCacheHeaders(createOptions({
            [KEY_STALE_WHILE_REVALIDATE]: 'one_minute',
            [KEY_STALE_IF_ERROR]: 'one_week'
        }));
        const expect = {
            [CACHE_CONTROL_STR]: `${NO_CACHE_NO_STORE}, stale-while-revalidate=60, stale-if-error=604800`,
            [SURROGATE_CONTROL_STR]: 'max-age=600',
            'Last-Modified': now
        };
        headerAssertions(actual, expect);
    });
    it('should return 0 for an invalid value passed in', function () {
        const actual = generateAllCacheHeaders(createOptions({
            [KEY_STALE_WHILE_REVALIDATE]: '10minute',
            [KEY_STALE_IF_ERROR]: 'never'
        }));
        const expect = {
            [CACHE_CONTROL_STR]: `${NO_CACHE_NO_STORE}, stale-while-revalidate=0, stale-if-error=0`,
            [SURROGATE_CONTROL_STR]: 'max-age=600',
            'Last-Modified': now
        };
        headerAssertions(actual, expect);
    });
    it('should not set stale headers if set to false', function () {
        const actual = generateAllCacheHeaders(createOptions({
            [KEY_STALE_WHILE_REVALIDATE]: false,
            [KEY_STALE_IF_ERROR]: false
        }));
        const expect = {
            [CACHE_CONTROL_STR]: NO_CACHE_NO_STORE,
            [SURROGATE_CONTROL_STR]: 'max-age=600',
            'Last-Modified': now
        };
        headerAssertions(actual, expect);
    });
    describe('setting time values', function () {
        const times = ['ONE_MINUTE', 'TEN_MINUTES', 'HALF_HOUR',
            'ONE_HOUR', 'ONE_DAY', 'ONE_WEEK', 'ONE_MONTH', 'ONE_YEAR',
            'INVALID', false, 0];

        function createExpect(time) {
            if (time === 'INVALID' || time === false || time === 0) {
                time = 0;
            } else {
                time = timeValues[time];
            }
            return Object.assign({},
                staticHeaders,
                {
                    [CACHE_CONTROL_STR]: NO_CACHE_NO_STORE,
                    [SURROGATE_CONTROL_STR]: `max-age=${time}`,
                    'Last-Modified': now
                }
            );
        }

        times.forEach(function (time) {
            it(`should correctly set the time value for ${time}`, function () {
                const options = createOptions.call(null, {
                    [KEY_SURROGATE_CONTROL]: time
                });
                const actual = generateAllCacheHeaders.call(null, options);
                const expect = createExpect.call(null, time);
                headerAssertions(actual, expect);
            });
        });
    });
});
