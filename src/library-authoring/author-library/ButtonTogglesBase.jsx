import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

const ButtonTogglesBase = ({ setShowPreviews, showPreviews, intl }) => (
  <>
    <Button
      variant="outline-primary"
      className="ml-1"
      onClick={() => setShowPreviews(!showPreviews)}
      size="sm"
    >
      { intl.formatMessage(showPreviews ? messages['library.detail.hide_previews'] : messages['library.detail.show_previews']) }
    </Button>
    {/* todo: either replace the scroll to the add components button functionality
              with a better UX for the add component button at the top, or just
              remove it entirely */}
    <Button
      variant="primary"
      className="mr-1"
      size="sm"
      onClick={() => {
        const addComponentSection = document.getElementById('add-component-section');
        addComponentSection.scrollIntoView({ behavior: 'smooth' });
      }}
      iconBefore={Add}
    >
      {intl.formatMessage(messages['library.detail.add.new.component.item'])}
    </Button>
  </>
);

ButtonTogglesBase.propTypes = {
  intl: intlShape.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
};

const ButtonToggles = injectIntl(ButtonTogglesBase);
export default ButtonToggles;
