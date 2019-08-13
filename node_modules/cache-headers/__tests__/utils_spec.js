import assert from 'assert';
import {isValidObject, isNumberLike, formatDate} from '../src/utils';

const EXPECT_FALSE = false;
const EXPECT_TRUE = true;

describe('utils', function () {
    describe('true object', function () {
        it('should return `false` if an array is passed in', () => {
            const actual = isValidObject([1, 2, 3]);
            assert.deepEqual(actual, EXPECT_FALSE);
        });
        it('should return `false` if an actual empty object is passed in', () => {
            const actual = isValidObject({});
            assert.deepEqual(actual, EXPECT_FALSE);
        });
        it('should return `true` if an actual object is passed in', () => {
            const actual = isValidObject({ a: 1, b: 2, c: 3 });
            assert.deepEqual(actual, EXPECT_TRUE);
        });
    });

    describe('isNumberLike', function () {
        it('should return `true` if a number is passed in as a string or number', function () {
            let actual = isNumberLike('51');
            assert.deepEqual(actual, EXPECT_TRUE);
            actual = isNumberLike(51);
            assert.deepEqual(actual, EXPECT_TRUE);
        });
        it('should return false if a passed in a non-number-like value', function () {
            let actual = isNumberLike(false);
            assert.deepEqual(actual, EXPECT_FALSE);
            actual = isNumberLike('derp');
            assert.deepEqual(actual, EXPECT_FALSE);
        });
    });

    describe('formatDate', function () {
        const date = new Date('2001-01-01');
        const formatted = 'Mon, 01 Jan 2001 00:00:00 GMT';
        it('should format the date based on the default format', function () {
            const now = formatDate({date});
            assert.equal(now, formatted);
        });
        describe('invalid date values', function () {
            it('should create a new date string if date is invalid', function () {
                const now = formatDate({date: new Date('invalid')});
                const actualNow = formatDate({date: new Date()});
                assert.equal(now, actualNow);
            });
            it('should create a new date string if date is null', function () {
                const now = formatDate({date: null});
                const actualNow = formatDate({date: new Date()});
                assert.equal(now, actualNow);
            });
        });
    });

});
