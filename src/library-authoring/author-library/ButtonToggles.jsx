import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Sync } from '@edx/paragon/icons';
import messages from './messages';

const ButtonToggles = ({ setShowPreviews, showPreviews, intl }) => (
  <>
    {/* todo: either reimplement the scroll to the add components button functionality,
              figure out a better UX for the add component button at the top, or just
              remove it entirely */}
    {/* <Button variant="primary" className="mr-1" disabled={sending} onClick={quickAddBehavior} iconBefore={Add}>
      {intl.formatMessage(messages[`library.detail.add_${library.type}`])}
    </Button> */}
    <Button
      variant="primary"
      className="ml-1"
      onClick={() => setShowPreviews(!showPreviews)}
      iconBefore={Sync}
      size="sm"
    >
      { intl.formatMessage(showPreviews ? messages['library.detail.hide_previews'] : messages['library.detail.show_previews']) }
    </Button>
  </>
);

ButtonToggles.propTypes = {
  intl: intlShape.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
};

export default injectIntl(ButtonToggles);
