/**
 * Validation helpers - aligned with backend validators
 */

import { VALIDATION } from './constants';

/**
 * Validate Ethiopian phone number (+251 9XX XXX XXX)
 * @param {string} phone
 * @returns {{ valid: boolean, message?: string }}
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, message: 'Phone number is required' };
  }
  const cleaned = phone.replace(/\s/g, '');
  if (!VALIDATION.PHONE_REGEX.test(cleaned)) {
    return { valid: false, message: 'Enter a valid Ethiopian phone (e.g. +251911234567)' };
  }
  return { valid: true };
};

/**
 * Validate email
 * @param {string} email
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  if (!VALIDATION.EMAIL_REGEX.test(email.trim())) {
    return { valid: false, message: 'Enter a valid email address' };
  }
  return { valid: true };
};

/**
 * Validate password (min length)
 * @param {string} password
 * @param {number} minLength
 * @returns {{ valid: boolean, message?: string }}
 */
export const validatePassword = (password, minLength = VALIDATION.PASSWORD_MIN_LENGTH) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters` };
  }
  return { valid: true };
};

/**
 * Validate required field
 * @param {*} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

/**
 * Validate numeric range
 * @param {number} value
 * @param {object} options { min, max }
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateNumber = (value, options = {}) => {
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: 'Must be a number' };
  }
  if (options.min != null && num < options.min) {
    return { valid: false, message: `Must be at least ${options.min}` };
  }
  if (options.max != null && num > options.max) {
    return { valid: false, message: `Must be at most ${options.max}` };
  }
  return { valid: true };
};

/**
 * Run multiple validators; return first error or valid
 * @param {Array<() => { valid: boolean, message?: string }>} validators
 * @returns {{ valid: boolean, message?: string }}
 */
export const runValidators = (...validators) => {
  for (const fn of validators) {
    const result = fn();
    if (!result.valid) return result;
  }
  return { valid: true };
};
