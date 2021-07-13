/**
 * @ignore
 * User: daletan
 * Date: 12/19/15
 * Time: 10:25 PM
 * Copyright 1stdibs.com, Inc. 2015. All Rights Reserved.
 */

'use strict';

import regular from 'regular';
import isEmpty from 'lodash.isempty';

/**
 * @param {*} val The value to check if it is an actual object. Arrays are not considered objects in this case
 * @return {boolean}
 */
export function isValidObject(val) {
    return !Array.isArray(val) && typeof val === 'object' && !isEmpty(val);
}

/**
 *
 * @param {*} val The value to check if it is like a number ie. 100 and "100" would return true
 * @return {boolean}
 */
export function isNumberLike(val) {
    return regular.number.test(val);
}

/**
 * Format a UTC Date value
 * @param {object} options
 * @param {number} [options.date=new Date()] UTC time format. A JavaScript date object
 * @return {string} header date string in GMT format
 */
export function formatDate(options = {}) {
    let {date = new Date()} = options;
    if ((date && date.toString() === 'Invalid Date') || !date) {
        // covers if the following are passed in:
        // new Date('invalid_date_string')
        // date = null
        date = new Date();
    }
    return date.toUTCString();
}
