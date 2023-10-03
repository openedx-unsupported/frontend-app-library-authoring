import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ActionRow, Form, IconButton } from '@edx/paragon';
import { EditOutline } from '@edx/paragon/icons';
import { libraryShape } from '../../common';
import { selectLibraryEdit, updateLibrary } from '../../configure-library/data';

/**
 * LibraryAuthoringPageHeaderBase
 * Title component for the LibraryAuthoringPageBase.
 */
const LibraryAuthoringPageHeader = ({ intl, library, ...props }) => {
  const [inputIsActive, setIsActive] = useState(false);
  const handleSaveTitle = (event) => {
    const newTitle = event.target.value;
    if (newTitle && newTitle !== library.title) {
      props.updateLibrary({ data: { title: newTitle, libraryId: library.id } });
    }
    setIsActive(false);
  };
  const handleClick = () => {
    setIsActive(true);
  };

  return (
    <h2 className="page-header-title">
      { inputIsActive
        ? (
          <Form.Control
            autoFocus
            name="title"
            id="title"
            type="text"
            aria-label="Title input"
            defaultValue={library.title}
            onBlur={handleSaveTitle}
            onKeyDown={event => {
              if (event.key === 'Enter') { handleSaveTitle(event); }
            }}
          />
        )
        : (
          <ActionRow>
            {library.title}
            <IconButton
              invertColors
              isActive
              iconAs={EditOutline}
              alt="Edit name button"
              onClick={handleClick}
              className="ml-3"
            />
          </ActionRow>
        )}
    </h2>
  );
};

LibraryAuthoringPageHeader.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  updateLibrary: PropTypes.func.isRequired,
};

export default connect(
  selectLibraryEdit,
  { updateLibrary },
)(injectIntl(LibraryAuthoringPageHeader));
