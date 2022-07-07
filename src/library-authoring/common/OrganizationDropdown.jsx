import React from 'react';

import { Icon, IconButton } from '@edx/paragon';
import { ExpandLess, ExpandMore } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import FormGroup from './FormGroup';

class OrganizationDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayValue: '',
      icon: this.expandMoreButton(),
      errorMessage: '',
      showFieldError: true,
      dropDownItems: [],
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.value !== nextProps.value && nextProps.value !== null) {
      const opt = this.props.options.find((o) => o === nextProps.value);
      if (opt && opt !== this.state.displayValue) {
        this.setState({ displayValue: opt, showFieldError: false });
      }
      return false;
    }

    return true;
  }

  getItems(strToFind = '') {
    let { options } = this.props;
    if (strToFind.length > 0) {
      options = options.filter((option) => (option.toLowerCase().includes(strToFind.toLowerCase())));
    }

    return options.map((opt) => {
      let value = opt;
      if (value.length > 30) {
        value = value.substring(0, 30).concat('...');
      }

      return (
        <button
          type="button"
          className="dropdown-item data-hj-suppress"
          value={value}
          key={value}
          onClick={(e) => { this.handleItemClick(e); }}
        >
          {value}
        </button>
      );
    });
  }

  setValue(value) {
    if (this.props.value === value) {
      return;
    }

    if (this.props.handleChange) {
      this.props.handleChange(value);
    }

    const opt = this.props.options.find((o) => o === value);
    if (opt && opt !== this.state.displayValue) {
      this.setState({ displayValue: opt, showFieldError: false });
    }
  }

  setDisplayValue(value) {
    const normalized = value.toLowerCase();
    const opt = this.props.options.find((o) => o.toLowerCase() === normalized);
    if (opt) {
      this.setValue(opt);
      this.setState({ displayValue: opt, showFieldError: false });
    } else {
      this.setValue(null);
      this.setState({ displayValue: value, showFieldError: true });
    }
  }

  handleClick = (e) => {
    const dropDownItems = this.getItems(e.target.value);
    if (dropDownItems.length > 1) {
      this.setState({ dropDownItems, icon: this.expandLessButton(), errorMessage: '' });
    }

    if (this.state.dropDownItems.length > 0) {
      this.setState({ dropDownItems: '', icon: this.expandMoreButton(), errorMessage: '' });
    }
  }

  handleOnChange = (e) => {
    const findstr = e.target.value;

    if (findstr.length) {
      const filteredItems = this.getItems(findstr);
      this.setState({ dropDownItems: filteredItems, icon: this.expandLessButton(), errorMessage: '' });
    } else {
      this.setState({ dropDownItems: '', icon: this.expandMoreButton(), errorMessage: this.props.errorMessage });
    }

    this.setDisplayValue(e.target.value);
  }

  handleClickOutside = () => {
    if (this.state.dropDownItems.length > 0) {
      const msg = this.state.displayValue === '' ? this.props.errorMessage : '';
      this.setState(() => ({
        icon: this.expandMoreButton(),
        dropDownItems: '',
        errorMessage: msg,
      }));
    }
  }

  handleExpandLess() {
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
  }

  handleExpandMore(e) {
    const dropDownItems = this.getItems(e.target.value);
    this.setState({
      dropDownItems, icon: this.expandLessButton(), errorMessage: '', showFieldError: false,
    });
  }

  handleFocus(e) {
    if (this.props.handleFocus) { this.props.handleFocus(e); }
  }

  handleOnBlur(e) {
    if (this.props.handleBlur) { this.props.handleBlur(e); }
  }

  handleItemClick(e) {
    this.setValue(e.target.value);
    this.setState({ dropDownItems: '', icon: this.expandMoreButton() });
  }

  expandMoreButton() {
    return (
      <IconButton
        className="expand-more"
        src={ExpandMore}
        iconAs={Icon}
        size="sm"
        variant="secondary"
        alt="expand-more"
        onClick={(e) => { this.handleExpandMore(e); }}
      />
    );
  }

  expandLessButton() {
    return (
      <IconButton
        className="expand-less"
        src={ExpandLess}
        iconAs={Icon}
        size="sm"
        variant="secondary"
        alt="expand-less"
        onClick={(e) => { this.handleExpandLess(e); }}
      />
    );
  }

  render() {
    return (
      <div className="dropdown-group-wrapper">
        <FormGroup
          name={this.props.name}
          type="text"
          value={this.state.displayValue}
          readOnly={this.props.readOnly}
          controlClassName={this.props.controlClassName}
          errorMessage={this.props.errorMessage}
          trailingElement={this.state.icon}
          floatingLabel={this.props.floatingLabel}
          placeholder={this.props.placeholder}
          helpText={this.props.helpMessage}
          handleChange={this.handleOnChange}
          handleClick={this.handleClick}
          handleBlur={this.handleOnBlur}
          handleFocus={this.handleFocus}
        />
        <div className="dropdown-container">
          { this.state.dropDownItems.length > 0 ? this.state.dropDownItems : null }
        </div>
      </div>
    );
  }
}

OrganizationDropdown.defaultProps = {
  options: null,
  floatingLabel: null,
  handleFocus: null,
  handleChange: null,
  handleBlur: null,
  value: null,
  errorMessage: null,
  errorCode: null,
  readOnly: false,
};

OrganizationDropdown.propTypes = {
  options: PropTypes.array,
  floatingLabel: PropTypes.string,
  handleFocus: PropTypes.func,
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  value: PropTypes.string,
  errorMessage: PropTypes.string,
  errorCode: PropTypes.string,
  name: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};

export default onClickOutside(OrganizationDropdown);
