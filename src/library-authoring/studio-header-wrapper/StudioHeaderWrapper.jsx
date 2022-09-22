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
  Dropdown
} from '@edx/paragon';
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
make settings dropdown button look nice
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
              title={library.title}
              subtitle={library.org}
              destination={ROUTES.Detail.HOME_SLUG(library.id)}/>
            <ActionRow.Spacer />
            <Dropdown>
              <Dropdown.Toggle id="library-header-menu-dropdown">
                {intl.formatMessage(libraryDetailMessages['library.detail.settings.menu'])}
                {/* <Icon className="fa fa-caret-down pl-3" alt="" /> */}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to={ROUTES.Detail.EDIT_SLUG(library.id)}>{intl.formatMessage(libraryDetailMessages['library.detail.settings.details'])}</Dropdown.Item>
                <Dropdown.Item as={Link} to={ROUTES.Detail.ACCESS_SLUG(library.id)}>{intl.formatMessage(libraryDetailMessages['library.detail.settings.access'])}</Dropdown.Item>
                <Dropdown.Item as={Link} to={ROUTES.Detail.IMPORT_SLUG(library.id)}>{intl.formatMessage(libraryDetailMessages['library.detail.settings.import'])}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </> : <></>
      }
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
