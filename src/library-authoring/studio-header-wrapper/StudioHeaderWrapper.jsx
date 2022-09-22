import React from 'react';
import { StudioHeader } from '@edx/frontend-component-header';
import { connect } from 'react-redux';
import selectLibraryDetail from '../common/data/selectors';
import {
  fetchLibraryDetail,
} from '../author-library/data';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Dropdown
} from '@edx/paragon';
import messages from './messages';
import libraryDetailMessages from '../author-library/messages';
import { Link } from 'react-router-dom';
import {
  ROUTES,
} from '../common';

// todo: figure out why this works when doing this, but not when importing from
// frontend-component-header (getting "You should not use <Link> outside a <Router>") error
import ContentTitleBlock from './ContentTitleBlock';

/*
todo list
figure out a better way to handle getting the data
(pressing the back button leaves the header populated with contextual data)
*/

const StudioHeaderWrapperBase = ({intl, ...props}) => {
  // loadingStatus will only ever be 'loaded' on pages
  // where we have library details, so we can use that to
  // determine if we want to render the ContentTitleBlock or not
  const { loadingStatus, library } = props;

  const actionRowContent = (
    <>
      {(loadingStatus === 'loaded') ? 
          <>
            <ContentTitleBlock
              // as={Link} todo try this
              title={library.title}
              subtitle={library.org}
              destination={ROUTES.Detail.HOME_SLUG(library.id)}/>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="library-header-menu-dropdown">
                {intl.formatMessage(messages['library.header.settings.menu'])}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to={ROUTES.Detail.EDIT_SLUG(library.id)}>{intl.formatMessage(messages['library.header.settings.details'])}</Dropdown.Item>
                <Dropdown.Item as={Link} to={ROUTES.Detail.ACCESS_SLUG(library.id)}>{intl.formatMessage(messages['library.header.settings.access'])}</Dropdown.Item>
                <Dropdown.Item as={Link} to={ROUTES.Detail.IMPORT_SLUG(library.id)}>{intl.formatMessage(messages['library.header.settings.import'])}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </> : <></>
      }
      <ActionRow.Spacer />
      <Button
        variant="tertiary"
        href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
        rel="noopener noreferrer"
        target="_blank"
        title={intl.formatMessage(messages['library.header.nav.help.title'])}
      >{intl.formatMessage(messages['library.header.nav.help'])}</Button>
    </>
  );

  return (
    <StudioHeader actionRowContent={actionRowContent}/>
  )
};

const StudioHeaderWrapper = connect(
  selectLibraryDetail,
  {
    fetchLibraryDetail,
  },
)(injectIntl(StudioHeaderWrapperBase));

export default StudioHeaderWrapper;
