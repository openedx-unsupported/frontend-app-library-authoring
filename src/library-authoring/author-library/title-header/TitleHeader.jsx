import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ActionRow } from '@edx/paragon';
import LibraryAuthoringPageHeader from './LibraryAuthoringPageHeader';
import ButtonToggles from '../ButtonToggles';
import messages from '../messages';
import { libraryShape } from '../../common';

const TitleHeader = ({
  library,
  quickAddBehavior,
  sending,
  setShowPreviews,
  showPreviews,
  // injected
  intl,
}) => (
  <header className="mast has-actions">
    <small className="card-subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
    <ActionRow>
      <LibraryAuthoringPageHeader
        library={library}
      />
      <ActionRow.Spacer />
      <ButtonToggles
        setShowPreviews={setShowPreviews}
        showPreviews={showPreviews}
        library={library}
        sending={sending}
        quickAddBehavior={quickAddBehavior}
      />
    </ActionRow>
  </header>
);

TitleHeader.propTypes = {
  intl: intlShape.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
  sending: PropTypes.func,
  quickAddBehavior: PropTypes.func,
  library: libraryShape.isRequired,
};

TitleHeader.defaultProps = {
  sending: null,
  quickAddBehavior: null,
};

export default injectIntl(TitleHeader);
