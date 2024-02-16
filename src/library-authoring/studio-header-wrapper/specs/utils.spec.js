import { getConfig, setConfig } from '@edx/frontend-platform';
import { LOADING_STATUS } from '../../common';
import { getMainMenuDropdown, getOutlineLink } from '../utils';

const intl = {
  formatMessage: jest.fn(message => message.defaultMessage),
};

describe('studio header wrapper utils', () => {
  describe('getOutlineLink', () => {
    it('should return /library/:libraryId', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.LOADED;
      const expected = `/library/${libraryId}`;
      const actual = getOutlineLink(loadingStatus, libraryId);
      expect(expected).toEqual(actual);
    });
    it('should return #', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.STANDBY;
      const expected = '#';
      const actual = getOutlineLink(loadingStatus, libraryId);
      expect(expected).toEqual(actual);
    });
  });
  describe('getMainMenuDropdown', () => {
    it('should return an array of length 1', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.LOADED;
      const dropdownArray = getMainMenuDropdown(loadingStatus, libraryId, { formatMessage: jest.fn() });
      expect(dropdownArray).toHaveLength(1);
    });
    it('should return an empty array', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.LOADING;
      const dropdownArray = getMainMenuDropdown(loadingStatus, libraryId, { formatMessage: jest.fn() });
      expect(dropdownArray).toHaveLength(0);
    });
  });

  it('should show the export tags sub item when the flag is true', () => {
    const libraryId = 'testId';
    const loadingStatus = LOADING_STATUS.LOADED;
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    const dropdownArray = getMainMenuDropdown(loadingStatus, libraryId, intl);
    expect(dropdownArray).toHaveLength(1);
    const subItemTitles = dropdownArray[0].items.map(item => item.title);
    expect(subItemTitles).toEqual([
      'Details',
      'User access',
      'Export Tags',
      'Import',
    ]);
  });
  it('should not show the export tags sub item when the flag is false', () => {
    const libraryId = 'testId';
    const loadingStatus = LOADING_STATUS.LOADED;
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
    });
    const dropdownArray = getMainMenuDropdown(loadingStatus, libraryId, intl);
    expect(dropdownArray).toHaveLength(1);
    const subItemTitles = dropdownArray[0].items.map(item => item.title);
    expect(subItemTitles).toEqual([
      'Details',
      'User access',
      'Import',
    ]);
  });
});
