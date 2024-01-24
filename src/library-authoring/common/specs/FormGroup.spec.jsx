import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormGroup from '../FormGroup';

describe('common/FormGroup.jsx', () => {
  let props;
  let mockHandleChange;
  let mockHandleFocus;
  let mockHandleClick;
  let mockHandleBlur;

  beforeEach(() => {
    mockHandleChange = jest.fn();
    mockHandleFocus = jest.fn();
    mockHandleClick = jest.fn();
    mockHandleBlur = jest.fn();
    props = {
      as: 'input',
      errorMessage: '',
      borderClass: '',
      autoComplete: null,
      readOnly: false,
      handleBlur: mockHandleBlur,
      handleChange: mockHandleChange,
      handleFocus: mockHandleFocus,
      handleClick: mockHandleClick,
      helpText: 'helpText text',
      options: null,
      trailingElement: null,
      type: 'text',
      children: null,
      className: '',
      floatingLabel: 'floatingLabel text',
      name: 'title',
      value: '',
    };
  });

  it('renders component without error', () => {
    render(<FormGroup {...props} />);
    const labelTextElement = screen.getByText(props.floatingLabel);
    const helpTextElement = screen.getByText(props.helpText);

    expect(labelTextElement).toBeInTheDocument();
    expect(labelTextElement.textContent).toEqual(props.floatingLabel);

    expect(helpTextElement).toBeInTheDocument();
    expect(helpTextElement.textContent).toEqual(props.helpText);
  });

  it('handles element focus', () => {
    render(<FormGroup {...props} />);

    const inputElement = screen.getByLabelText(props.floatingLabel);
    fireEvent.focus(inputElement);

    expect(mockHandleFocus).toHaveBeenCalled();
  });

  it('handles element blur', () => {
    render(<FormGroup {...props} />);

    const inputElement = screen.getByLabelText(props.floatingLabel);
    fireEvent.focus(inputElement);
    fireEvent.blur(inputElement);

    expect(mockHandleBlur).toHaveBeenCalled();
  });

  it('handles element click', () => {
    render(<FormGroup {...props} />);

    const inputElement = screen.getByLabelText(props.floatingLabel);
    fireEvent.click(inputElement);

    expect(mockHandleClick).toHaveBeenCalled();
  });
});
