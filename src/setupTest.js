/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import MutationObserver from '@sheerun/mutationobserver-shim';
import { mergeConfig } from '@edx/frontend-platform';

/* need to mock window for tinymce on import, as it is JSDOM incompatible */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

mergeConfig({
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
  BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
  SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL: process.env.SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL,
});

window.MutationObserver = MutationObserver;

let store = {};

const mockStorage = {
  getItem: (key) => {
    if (key in store) {
      return store[key];
    }
    return null;
  },
  setItem: (key, value) => {
    store[key] = `${value}`;
  },
  removeItem: (key) => {
    delete store[key];
  },
  reset() {
    store = {};
  },
};

Object.defineProperty(window, 'localStorage', { value: mockStorage });

// Mock the plugins repo so jest will stop complaining about ES6 syntax
jest.mock('frontend-components-tinymce-advanced-plugins', () => {});

// setupTest.js runs before Jest injects its environment. This file runs afterward.

const trueType = (variable) => {
  // typeof is almost useless. Arrays are 'objects'. NaN is a 'number'! NULL IS AN 'object'! WHY?!?
  if (Array.isArray(variable)) {
    return 'array';
  }
  if (variable === null) {
    return 'null';
  }
  if (Number.isNaN(variable)) {
    return 'NaN';
  }
  return typeof variable;
};

expect.extend({
  i18nDefinedIn(key, messages) {
    if (typeof messages !== 'object') {
      return {
        message: () => `expected i18n messages variable to be an object. It was ${typeof messages}`,
        pass: false,
      };
    }
    const entryType = trueType(messages[key]);
    if (entryType !== 'object') {
      return {
        message: () => `expected i18n key ${key} to be an object. It was: ${entryType}`,
        pass: false,
      };
    }
    const missingItems = [];
    const blankItems = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const attr of ['id', 'defaultMessage', 'description']) {
      const itemType = trueType(messages[key][attr]);
      if (itemType !== 'string') {
        missingItems.push([attr, itemType]);
      } else if (messages[key][attr].length === 0) {
        blankItems.push(attr);
      }
    }
    if (missingItems.length || blankItems.length) {
      let message = `Invalid message definition for ${key}.`;
      // eslint-disable-next-line no-restricted-syntax
      for (const [attr, type] of missingItems) {
        message += ` '${attr}' was ${type} (should be string).`;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const attr of blankItems) {
        message += ` '${attr}' is blank.`;
      }
      return {
        message: () => message,
        pass: false,
      };
    }
    if (messages[key].id !== key) {
      return {
        message: () => `expected i18n key "${key}" to have the same ID, but it had "${messages[key].id}" instead!`,
        pass: false,
      };
    }
    return {
      message: () => `expected i18n "${key}" to be valid.`,
      pass: true,
    };
  },
});
