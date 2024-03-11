import React from 'react';
import update from 'immutability-helper';
import { fireEvent, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { LibraryListPage } from '../LibraryListPage';
import { libraryListInitialState } from '../data';
import { LOADING_STATUS, ROUTES } from '../../common';
import { ctxMount } from '../../common/specs/helpers';
import { libraryFactory } from '../../common/specs/factories';
import { withNavigate } from '../../utils/hoc';

const mockNavigate = jest.fn();
const InjectedLibraryListPage = injectIntl(withNavigate(LibraryListPage));
const config = { STUDIO_BASE_URL: 'STUDIO_BASE_URL' };
const mockLibraryFetcher = jest.fn();
const props = {
  ...libraryListInitialState,
  fetchLibraryList: mockLibraryFetcher,
  status: LOADING_STATUS.LOADED,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('list-libraries/LibraryListPage.jsx', () => {
  afterEach(() => {
    mockLibraryFetcher.mockReset();
  });

  it('renders library list page without error', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );
  });

  it('renders library list page with loading', () => {
    const newProps = update(props, {
      status: { $set: LOADING_STATUS.LOADING },
    });

    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    expect(container.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('renders library list page with error', () => {
    const errorText = 'mock error message';

    const newProps = update(props, {
      status: { $set: LOADING_STATUS.FAILED },
      errorMessage: { $set: 'mock error message' },
    });

    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage.textContent).toEqual(`Error: ${errorText}`);
  });

  it('fetches library list on mount', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );

    expect(mockLibraryFetcher).toHaveBeenCalledWith({
      params: {
        org: '',
        page: 1,
        page_size: +process.env.LIBRARY_LISTING_PAGINATION_PAGE_SIZE,
        text_search: '',
        type: 'complex',
      },
    });
  });

  it('shows no pagination for empty library list', () => {
    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );

    expect(container.querySelector('.library-list-pagination')).toBeNull();
  });

  it('Paginates on big library list', () => {
    const newProps = update(props, {
      libraries: { count: { $set: 150 } },
    });

    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const paginationContainer = container.querySelector('.library-list-pagination');
    expect(paginationContainer).toBeInTheDocument();

    const previousButton = paginationContainer.querySelector('.previous.page-link');
    expect(previousButton).toBeInTheDocument();

    const nextButton = paginationContainer.querySelector('.next.page-link');
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(previousButton);
    fireEvent.click(previousButton);
    const commonParams = {
      org: '', page_size: +process.env.LIBRARY_LISTING_PAGINATION_PAGE_SIZE, text_search: '', type: 'complex',
    };
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(1, { params: { ...commonParams, page: 1 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(2, { params: { ...commonParams, page: 2 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(3, { params: { ...commonParams, page: 3 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(4, { params: { ...commonParams, page: 2 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(5, { params: { ...commonParams, page: 1 } });
  });

  it('shows empty page for empty library list', () => {
    const newProps = update(props, {
      libraries: { count: { $set: 0 } },
    });

    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    expect(container.querySelector('.library-list .library-item')).toBeNull();

    const emptyHeadingText = container.querySelector('h2').textContent;
    expect(emptyHeadingText).toEqual('Add your first library to get started');
  });

  it('shows the create form when clicking the new library button on a empty page', () => {
    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );

    const emptyPage = container.querySelector('.pgn__card.horizontal');
    expect(emptyPage).toBeInTheDocument();

    const newLibraryButton = emptyPage.querySelector('button.btn-outline-primary');
    fireEvent.click(newLibraryButton);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.CREATE);
  });

  it('handle click on library listing item', () => {
    const library = libraryFactory();
    const newProps = update(props, {
      libraries: {
        data: { $push: [{ ...library }] },
        count: { $set: 1 },
      },
    });

    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const libraryItem = container.querySelector('.library-item');
    fireEvent.click(libraryItem);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('handle click create library page', () => {
    const library = libraryFactory();
    const newProps = update(props, {
      libraries: {
        data: { $push: [{ ...library }] },
        count: { $set: 1 },
      },
    });

    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const newLibraryBtn = container.querySelector('.btn-primary');
    fireEvent.click(newLibraryBtn);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.CREATE);
  });
});
