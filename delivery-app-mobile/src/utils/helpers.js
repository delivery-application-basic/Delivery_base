/**
 * Helper utilities - used across the app
 */

import { CURRENCY_SYMBOL } from './constants';

/**
 * Format number as Ethiopian Birr (ETB)
 * @param {number} amount
 * @param {boolean} showSymbol
 * @returns {string}
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount == null || isNaN(amount)) return showSymbol ? `${CURRENCY_SYMBOL} 0` : '0';
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `${CURRENCY_SYMBOL} ${formatted}` : formatted;
};

/**
 * Format date for display
 * @param {string|Date} date
 * @param {object} options Intl.DateTimeFormatOptions
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

/**
 * Format time (HH:MM)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date and time
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Truncate string with ellipsis
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 50) => {
  if (!str || typeof str !== 'string') return '';
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @param {string} str
 * @returns {string}
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Format Ethiopian phone for display (+251 9XX XXX XXX)
 * @param {string} phone
 * @returns {string}
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('251')) {
    return `+251 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Check if value is empty (null, undefined, '', [], {})
 */
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
