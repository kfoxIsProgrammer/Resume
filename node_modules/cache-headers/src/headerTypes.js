/**
 * Maps to keys in the different cache methods
 * @type {Object}
 */


const KEY_LAST_MODIFIED = 'lastModified';
const KEY_STALE_IF_ERROR = 'staleError';
const KEY_STALE_WHILE_REVALIDATE = 'staleRevalidate';
const KEY_SURROGATE_CONTROL = 'maxAge';

export {
    KEY_LAST_MODIFIED,
    KEY_STALE_IF_ERROR,
    KEY_STALE_WHILE_REVALIDATE,
    KEY_SURROGATE_CONTROL
};
