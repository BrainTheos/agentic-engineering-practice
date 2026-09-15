/**
 * @description Converts a date string to an ISO 8601 string.
 * @param {string} dateStr - The date string to parse.
 * @returns {string|null} The ISO 8601 representation of the date, or `null` if `dateStr` is falsy or not a valid date.
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * @description Converts a string into a URL-friendly slug (lowercase, hyphen-separated, non-word characters stripped).
 * @param {string} str - The string to slugify.
 * @returns {string} The slugified string.
 */
function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

/**
 * @description Truncates a string to a maximum length, appending an ellipsis when truncated.
 * @param {string} str - The string to truncate.
 * @param {number} len - The maximum length before truncation.
 * @returns {string} The original string if it is falsy or within `len`, otherwise the string truncated to `len` characters with `...` appended.
 */
function truncate(str, len) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '...';
}

/**
 * @description Checks whether a string is a syntactically valid email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} `true` if the string matches a basic email pattern, otherwise `false`.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @description Checks whether a value is a string containing non-whitespace characters.
 * @param {*} val - The value to check.
 * @returns {boolean} `true` if `val` is a string with non-whitespace content, otherwise `false`.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * @description Builds a pagination metadata object from a total count and page parameters.
 * @param {number} total - The total number of items across all pages.
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of items per page.
 * @returns {{total: number, page: number, pageSize: number, totalPages: number}} The pagination metadata, including the computed total number of pages.
 */
function buildPaginationMeta(total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * @description Parses a value as an integer, falling back to a default when parsing fails.
 * @param {*} val - The value to parse.
 * @param {*} fallback - The value to return if `val` cannot be parsed as an integer.
 * @returns {number|*} The parsed integer, or `fallback` if parsing produces `NaN`.
 */
function parseIntSafe(val, fallback) {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

module.exports = { formatDate, slugify, truncate, validateEmail, isNonEmptyString, buildPaginationMeta, parseIntSafe };
