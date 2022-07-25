import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Button, Icon, StatefulButton, Alert, Form,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import {
  LIBRARY_TYPES,
  SUBMISSION_STATUS,
  libraryShape,
  truncateMessage,
} from '../common';
import {
  clearFormError,
  createLibrary,
  libraryCreateInitialState,
  resetForm,
  selectLibraryCreate,
} from './data';

import commonMessages from '../common/messages';
import messages from './messages';
import { LicenseFieldContainer } from '../common/LicenseField';

class LibraryCreateForm extends React.Component {
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

  mockInputChange = (name) => (value) => this.onValueChange({ target: { value, name, type: 'text' } })

  onCancel = () => {
    this.props.resetForm();
    this.props.hideForm();
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.createLibrary({ data: this.state.data });
  }

  hasFieldError = (fieldName) => {
    const { errorFields } = this.props;

    if (errorFields && (fieldName in errorFields)) {
      return true;
    }

    return false;
  }

  getFieldError = (fieldName) => {
    if (this.hasFieldError(fieldName)) {
      return this.props.errorFields[fieldName];
    }

    return null;
  }

  formIsValid = () => {
    const { data } = this.state;

    if (data.title && data.org && data.slug) {
      return true;
    }

    return false;
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

  handleDismissAlert = () => {
    this.props.clearFormError();
  }

  render() {
    const { intl, errorMessage } = this.props;
    const { data } = this.state;

    return (
      <form onSubmit={this.onSubmit} className="form-create">
        <h3 className="title">{intl.formatMessage(messages['library.form.create.library'])}</h3>
        <fieldset>
          {errorMessage
          && (
          <Alert
            variant="danger"
            onClose={this.handleDismissAlert}
            dismissible
          >
            {truncateMessage(errorMessage)}
          </Alert>
          )}
          <ol className="list-input">
            {['title', 'org', 'slug'].map(name => (
              <li className="field" key={name}>
                <Form.Group
                  controlId={name}
                  isInvalid={this.hasFieldError(name)}
                  className="mb-0 mr-2"
                >
                  <Form.Label className="h6 d-block" htmlFor={name}>
                    {intl.formatMessage(messages[`library.form.${name}.label`])}
                  </Form.Label>
                  <Form.Control
                    name={name}
                    id={name}
                    type="text"
                    placeholder={intl.formatMessage(messages[`library.form.${name}.placeholder`])}
                    defaultValue={data[name]}
                    onChange={this.onValueChange}
                  />
                  <Form.Text>{intl.formatMessage(messages[`library.form.${name}.help`])}</Form.Text>
                  {this.hasFieldError(name) && (
                    <Form.Control.Feedback hasIcon={false} type="invalid">
                      {this.getFieldError(name)}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </li>
            ))}
            <li className="field">
              <Form.Group
                controlId="type"
                isInvalid={this.hasFieldError('type')}
                className="mb-0 mr-2"
              >
                <Form.Label className="h6 d-block" htmlFor="type">
                  {intl.formatMessage(messages['library.form.type.label'])}
                </Form.Label>
                <Form.Control
                  name="type"
                  id="type"
                  as="select"
                  value={data.type}
                  onChange={this.onValueChange}
                >
                  {Object.values(LIBRARY_TYPES).map(value => (
                    <option value={value} key={`aoption-${value}`}>
                      {intl.formatMessage(messages[`library.form.type.label.${value}`])}
                    </option>
                  ))}
                </Form.Control>
                <Form.Text>{intl.formatMessage(messages['library.form.type.help'])}</Form.Text>
                {this.hasFieldError('type') && (
                  <Form.Control.Feedback hasIcon={false} type="invalid">
                    {this.getFieldError('type')}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </li>
            <li className={`field ${(data.type === 'legacy' && 'd-none') || ''}`}>
              { /* Retain caching capabilities by hiding rather than removing this field. */ }
              <LicenseFieldContainer
                value={data.license}
                updateValue={this.mockInputChange('license')}
              />
            </li>
          </ol>
        </fieldset>
        <div className="actions form-group">
          <StatefulButton
            state={this.getSubmitButtonState()}
            labels={{
              disabled: intl.formatMessage(commonMessages['library.common.forms.button.submit']),
              enabled: intl.formatMessage(commonMessages['library.common.forms.button.submit']),
              pending: intl.formatMessage(commonMessages['library.common.forms.button.submitting']),
            }}
            icons={{
              pending: <Icon className="fa fa-spinner fa-spin" />,
            }}
            disabledStates={['disabled', 'pending']}
            className="action btn-primary"
            type="submit"
          />
          <Button
            className="action btn-light"
            onClick={this.onCancel}
          >
            {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
          </Button>
        </div>
      </form>
    );
  }
}

LibraryCreateForm.propTypes = {
  clearFormError: PropTypes.func.isRequired,
  createdLibrary: libraryShape,
  createLibrary: PropTypes.func.isRequired,
  errorFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  errorMessage: PropTypes.string,
  hideForm: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  resetForm: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.values(SUBMISSION_STATUS)).isRequired,
};

LibraryCreateForm.defaultProps = libraryCreateInitialState;

export default connect(
  selectLibraryCreate,
  {
    clearFormError,
    createLibrary,
    resetForm,
  },
)(injectIntl(withRouter(LibraryCreateForm)));
