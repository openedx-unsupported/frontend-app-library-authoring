import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ensureConfig } from '@edx/frontend-platform/config';
import { StudioHeader, MenuContentItem } from '@edx/frontend-component-header-edx';

import { ROUTES, libraryShape } from '../common';
import { selectLibraryDetail } from '../library-detail';
import messages from './messages';

ensureConfig([
  'STUDIO_BASE_URL',
  'LOGOUT_URL',
], 'Library header');

const Header = ({ intl, library }) => {
  const mainMenu = !library
    ? null
    : [
      {
        type: 'dropdown',
        href: '#',
        content: intl.formatMessage(messages['library.header.settings.menu']),
        submenuContent: (
          <div>
            <MenuContentItem tag={Link} to={ROUTES.Detail.EDIT_SLUG(library.id)}>
              {intl.formatMessage(messages['library.header.settings.details'])}
            </MenuContentItem>
            <MenuContentItem tag={Link} to={ROUTES.Detail.ACCESS_SLUG(library.id)}>
              {intl.formatMessage(messages['library.header.settings.access'])}
            </MenuContentItem>
          </div>
        ),
      },
    ];

  return (
    <StudioHeader itemDetails={library} mainMenu={mainMenu} />
  );
};

Header.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
};

Header.defaultProps = {
  library: null,
};

export default connect(
  selectLibraryDetail,
)(injectIntl(Header));
