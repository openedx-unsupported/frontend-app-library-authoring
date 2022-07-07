import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { withRouter, Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { LibraryCreatePage } from '../LibraryCreatePage';
import { libraryCreateInitialState } from '../data';
import { SUBMISSION_STATUS } from '../../common';
import { ctxMount } from '../../common/specs/helpers';
import { ROUTES } from '../../common';

const InjectedLibraryCreatePage = injectIntl(withRouter(LibraryCreatePage));


describe('create-library/LibraryCreatePage.jsx', () => {
  const config = { STUDIO_BASE_URL: 'STUDIO_BASE_URL' };
  let props;
  let mockResetForm;
  let mockCreateLibrary;
  let mockFetchOrganizations;

  beforeEach(() => {
    mockResetForm = jest.fn();
    mockCreateLibrary = jest.fn();
    mockFetchOrganizations = jest.fn();
    props = {
      ...libraryCreateInitialState,
      resetForm: mockResetForm,
      createLibrary: mockCreateLibrary,
      fetchOrganizations: mockFetchOrganizations,
    };
  });

  it('renders library create page without error', () => {
    ctxMount(
        <BrowserRouter>
          <InjectedLibraryCreatePage {...props} />
        </BrowserRouter>,
      {config}
    );
  });

  it('fetches organizations list on mount', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      {config}
    );

    expect(mockFetchOrganizations).toHaveBeenCalled();
  });

  it('submits form without error', () => {
    const newProps = { ...props, orgs: ['org1', 'org2'] };
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      {config}
    );

    container.find('input').at(0).simulate('change', { target: { value: 'title test', name: 'title' } });
    container.find('input').at(1).simulate('change', { target: { value: 'org1', name: 'org' } });
    container.find('input').at(2).simulate('change', { target: { value: 'slug test', name: 'slug' } });

    const form = container.find('form').at(0);
    form.simulate('submit');

    expect(mockCreateLibrary).toHaveBeenCalled();
  });

  it('submits form with error', () => {
    const newProps = { ...props, errorFields: {slug: 'Error message'} };
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      {config}
    );

    expect(container.find('div[feedback-for="slug"]').text()).toEqual('Error message');
  });

  it('shows processing text on button', () => {
    const newProps = { ...props, status: SUBMISSION_STATUS.SUBMITTING };
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      {config}
    );

    const submitButton = container.find('[type="submit"]').at(0);
    expect(submitButton.text()).toEqual('Creating...');
  });

  it('cancels form', () => {
    const history = createMemoryHistory();
    const container = ctxMount(
      <BrowserRouter>
        <Router history={history}>
          <InjectedLibraryCreatePage {...props} />
        </Router>
      </BrowserRouter>,
      {config}
    );

    const cancelButton = container.find('button.btn-light').at(0);
    cancelButton.simulate('click');

    expect(history.location.pathname).toEqual(ROUTES.List.HOME);
  });
});
