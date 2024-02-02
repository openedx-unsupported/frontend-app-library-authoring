import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { LibraryCreatePage } from '../LibraryCreatePage';
import { libraryCreateInitialState } from '../data';
import { SUBMISSION_STATUS, ROUTES } from '../../common';
import { ctxMount } from '../../common/specs/helpers';
import { withNavigate } from '../../utils/hoc';
import messages from '../messages';

const InjectedLibraryCreatePage = injectIntl(withNavigate(LibraryCreatePage));
const config = { STUDIO_BASE_URL: 'STUDIO_BASE_URL' };
const mockResetForm = jest.fn();
const mockCreateLibrary = jest.fn();
const mockFetchOrganizations = jest.fn();
const props = {
  ...libraryCreateInitialState,
  resetForm: mockResetForm,
  createLibrary: mockCreateLibrary,
  fetchOrganizations: mockFetchOrganizations,
};
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('create-library/LibraryCreatePage.jsx', () => {
  it('renders library create page without error', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );
  });

  it('fetches organizations list on mount', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );

    expect(mockFetchOrganizations).toHaveBeenCalled();
  });

  it('submits form without error', () => {
    const newProps = { ...props, orgs: ['org1', 'org2'] };

    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    fireEvent.change(screen.getByLabelText('Library name'), { target: { value: 'title test', name: 'title' } });
    fireEvent.change(screen.getByLabelText('Organization'), { target: { value: 'org1', name: 'org' } });
    fireEvent.change(screen.getByLabelText('Library ID'), { target: { value: 'slug test', name: 'slug' } });

    const submitButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(submitButton);

    expect(mockCreateLibrary).toHaveBeenCalled();
  });

  describe('form errors', () => {
    let wrapper;
    beforeEach(() => {
      const newProps = { ...props, errorFields: { slug: 'Error message' } };
      wrapper = ctxMount(
        <BrowserRouter>
          <InjectedLibraryCreatePage {...newProps} />
        </BrowserRouter>,
        { config },
      );
    });

    it('shows empty title error', () => {
      fireEvent.change(screen.getByLabelText('Library name'), { target: { value: 'Title', name: 'title' } });
      fireEvent.change(screen.getByLabelText('Library name'), { target: { value: '', name: 'title' } });

      expect(wrapper.container.querySelector('.pgn__form-text-invalid').textContent).toEqual(messages['library.form.field.error.empty.title'].defaultMessage);
    });

    it('shows empty org error', () => {
      fireEvent.change(screen.getByLabelText('Organization'), { target: { value: 'Org', name: 'org' } });
      fireEvent.change(screen.getByLabelText('Organization'), { target: { value: '', name: 'org' } });
      fireEvent.blur(screen.getByLabelText('Organization'));

      expect(wrapper.container.querySelector('.pgn__form-text-invalid').textContent).toEqual(messages['library.form.field.error.empty.org'].defaultMessage);
    });

    it('shows empty slug error', () => {
      fireEvent.change(screen.getByLabelText('Library ID'), { target: { value: 'Slug', name: 'slug' } });
      fireEvent.change(screen.getByLabelText('Library ID'), { target: { value: '', name: 'slug' } });

      expect(wrapper.container.querySelector('.pgn__form-text-invalid').textContent).toEqual(messages['library.form.field.error.empty.slug'].defaultMessage);
    });

    it('shows mismatch org error', () => {
      fireEvent.change(screen.getByLabelText('Organization'), { target: { value: 'org2', name: 'org' } });
      fireEvent.blur(screen.getByLabelText('Organization'));
      expect(wrapper.container.querySelector('.pgn__form-text-invalid').textContent).toEqual(messages['library.form.field.error.mismatch.org'].defaultMessage);
    });

    it('shows invlaid slug error', () => {
      fireEvent.change(screen.getByLabelText('Library ID'), { target: { value: '###', name: 'slug' } });
      expect(wrapper.container.querySelector('.pgn__form-text-invalid').textContent).toEqual(messages['library.form.field.error.invalid.slug'].defaultMessage);
    });
  });

  it('shows processing text on button', () => {
    const newProps = { ...props, status: SUBMISSION_STATUS.SUBMITTING };
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const submitButton = screen.getByRole('button', { name: 'Creating...' });
    expect(submitButton.textContent).toEqual('Creating...');
  });

  it('cancels form', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );

    const cancelPageButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelPageButton);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.HOME);
  });

  it('shows leave modal and prevents leaving', () => {
    const { container } = ctxMount(
      <BrowserRouter>
        <InjectedLibraryCreatePage {...props} />
      </BrowserRouter>,
      { config },
    );

    const cancelPageButton = container.querySelector('button.btn-light');
    fireEvent.change(screen.getByLabelText('Library name'), { target: { value: 'title test', name: 'title' } });
    fireEvent.click(cancelPageButton);

    // The leave page modal was shown and history was updated but blocked
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.HOME);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

    // Reject the leave page modal
    const cancelModalButton = screen.getAllByText('Cancel');
    fireEvent.click(cancelModalButton[1]);
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();

    // Confirm the leave page modal and wasn't blocked
    fireEvent.click(cancelPageButton);
    const SubmitModalButton = screen.getByText('Ok');
    fireEvent.click(SubmitModalButton);
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.HOME);
  });
});
