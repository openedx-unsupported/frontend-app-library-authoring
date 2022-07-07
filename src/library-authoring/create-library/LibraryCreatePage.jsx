import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Button, Breadcrumb, Icon, StatefulButton, Alert } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import {
  ROUTES,
  LIBRARY_TYPES,
  SUBMISSION_STATUS,
  libraryShape,
  truncateMessage,
  FormGroup,
  OrganizationDropdown,
} from '../common';
import {
  createLibrary,
  libraryCreateInitialState,
  selectLibraryCreate,
  resetForm,
  fetchOrganizations,
} from './data';

import commonMessages from '../common/messages';
import messages from './messages';

export class LibraryCreatePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        title: '',
        org: '',
        slug: '',
        type: LIBRARY_TYPES.COMPLEX,
        license: '',
      },
    };
  }

  componentDidMount() {
    this.props.resetForm();
    this.props.fetchOrganizations();
  }

  componentDidUpdate(prevProps) {
    /* Redirect on submission success. */
    const { status, createdLibrary } = this.props;
    if (
      status !== prevProps.status
      && status === SUBMISSION_STATUS.SUBMITTED
      && createdLibrary !== prevProps.createdLibrary
      && createdLibrary !== null
    ) {
      if (createdLibrary.type === LIBRARY_TYPES.LEGACY) {
        window.location.href = createdLibrary.url;
      } else if (Object.values(LIBRARY_TYPES).includes(createdLibrary.type)) {
        this.props.history.push(createdLibrary.url);
      }
    }

    if (prevProps.status === SUBMISSION_STATUS.SUBMITTING && this.props.status === SUBMISSION_STATUS.FAILED) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  onValueChange = (event) => {
    const { name, value } = event.target;
    this.setState(state => ({
      data: {
        ...state.data,
        [name]: value,
      },
    }));
  }

  onCancel = () => {
    this.props.resetForm();
    this.props.history.push(ROUTES.List.HOME);
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.createLibrary({ data: this.state.data });
  }

  hasFieldError = (fieldName) => {
    const { errorFields } = this.props;

    return errorFields && (fieldName in errorFields);
  }

  getFieldError = (fieldName) => {
    if (this.hasFieldError(fieldName)) {
      return this.props.errorFields[fieldName];
    }

    return null;
  }

  formIsValid = () => {
    const { data } = this.state;

    return !!(data.title && data.org && data.slug);
  }

  getSubmitButtonState = () => {
    const { status } = this.props;

    let state;
    if (status === SUBMISSION_STATUS.SUBMITTING) {
      state = 'pending';
    } else if (this.formIsValid()) {
      state = 'enabled';
    } else {
      state = 'disabled';
    }

    return state;
  }

  render() {
    const { intl, errorMessage, orgs } = this.props;
    const { data } = this.state;
    const { config } = this.context;
    const error = errorMessage || this.props.errorFields
      ? intl.formatMessage(messages['library.form.generic.error.description']) : '';

    return (
      <div className="container-fluid">
        <div className="library-create-wrapper">
          {error && (
            <Alert
              icon={Info}
              variant="danger"
              className="form-create-alert"
            >
              <Alert.Heading>{intl.formatMessage(messages['library.form.generic.error.title'])}</Alert.Heading>
              <p>{truncateMessage(error)}</p>
            </Alert>
          )}
          <Breadcrumb
            activeLabel={intl.formatMessage(messages['library.form.breadcrumbs.current'])}
            links={[
              { label: intl.formatMessage(messages['library.form.breadcrumbs.home']), url: config.STUDIO_BASE_URL },
              { label: intl.formatMessage(messages['library.form.breadcrumbs.list']), url: ROUTES.List.HOME }
            ]}
          />
          <div className="wrapper-mast wrapper">
            <header className="has-actions">
              <h1 className="page-header h2">{intl.formatMessage(messages['library.form.create.library'])}</h1>
            </header>
          </div>
          <div className="wrapper-content wrapper">
            <section className="content">
              <form onSubmit={this.onSubmit} className="form-create">
                <fieldset>
                  <ol className="list-input">
                    <li className="field">
                      <FormGroup
                        name="title"
                        type="text"
                        readOnly={false}
                        value={data.title}
                        controlClassName="has-value"
                        handleChange={this.onValueChange}
                        errorMessage={this.getFieldError('title')}
                        floatingLabel={intl.formatMessage(messages['library.form.title.label'])}
                        placeholder={intl.formatMessage(messages['library.form.title.placeholder'])}
                        helpText={intl.formatMessage(messages['library.form.title.help'])}
                      />
                    </li>
                    <li className="field">
                      <OrganizationDropdown
                        disabled
                        type="text"
                        name="org"
                        readOnly={false}
                        value={data.org}
                        options={orgs}
                        controlClassName="has-value"
                        handleChange={
                          (value) => this.setState(prevState => ({ data: {...prevState.data, org: value} }))
                        }
                        floatingLabel={intl.formatMessage(messages['library.form.org.label'])}
                        placeholder={intl.formatMessage(messages['library.form.org.placeholder'])}
                        hasFieldError={this.hasFieldError('org')}
                        errorMessage={this.getFieldError('org')}
                        helpMessage={intl.formatMessage(messages['library.form.org.help'])}
                      />
                    </li>
                    <li className="field">
                      <FormGroup
                        name="slug"
                        type="text"
                        readOnly={false}
                        value={data.slug}
                        controlClassName="has-value"
                        handleChange={this.onValueChange}
                        errorMessage={this.getFieldError('slug')}
                        floatingLabel={intl.formatMessage(messages['library.form.slug.label'])}
                        placeholder={intl.formatMessage(messages['library.form.slug.placeholder'])}
                        helpText={intl.formatMessage(messages['library.form.slug.help'])}
                      />
                    </li>
                  </ol>
                </fieldset>
                <div className="actions form-group">
                  <Button
                    size="lg"
                    variant="tertiary"
                    onClick={this.onCancel}
                    className="mb-2 mb-sm-0 action btn-light"
                  >
                    {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
                  </Button>
                  <StatefulButton
                    size="lg"
                    type="submit"
                    variant="primary"
                    className="action btn-primary"
                    state={this.getSubmitButtonState()}
                    disabledStates={['disabled', 'pending']}
                    icons={{
                      pending: <Icon className="fa fa-spinner fa-spin" />,
                    }}
                    labels={{
                      disabled: intl.formatMessage(commonMessages['library.common.forms.button.create']),
                      enabled: intl.formatMessage(commonMessages['library.common.forms.button.create']),
                      pending: intl.formatMessage(commonMessages['library.common.forms.button.creating']),
                    }}
                  />
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

LibraryCreatePage.contextType = AppContext;

LibraryCreatePage.propTypes = {
  createdLibrary: libraryShape,
  createLibrary: PropTypes.func.isRequired,
  fetchOrganizations: PropTypes.func.isRequired,
  errorFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  errorMessage: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  resetForm: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.values(SUBMISSION_STATUS)).isRequired,
};

LibraryCreatePage.defaultProps = libraryCreateInitialState;

export default connect(
  selectLibraryCreate,
  {
    createLibrary,
    fetchOrganizations,
    resetForm,
  },
)(injectIntl(withRouter(LibraryCreatePage)));
