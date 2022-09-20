import React from 'react';
import { StudioHeader, ContentTitleBlock } from '@edx/frontend-component-header';
import { connect } from 'react-redux';
import selectLibraryDetail from '../common/data/selectors';
import {
  fetchLibraryDetail,
} from '../author-library/data';
import { injectIntl } from '@edx/frontend-platform/i18n';

const StudioHeaderWrapperBase = ({...props}) => {
  // loadingStatus will only ever be 'loaded' on pages
  // where we have library details, so we can use that to
  // determine if we want to render the ContentTitleBlock or not
  const { loadingStatus, library } = props;
  
  const actionRowContent = (
    <>
      {(loadingStatus === 'loaded') ? 
          <ContentTitleBlock 
            title={library.title}
            subtitle={library.org}
            destination='#'/> :
          <></>
      }
      <div>BLARG</div>
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
