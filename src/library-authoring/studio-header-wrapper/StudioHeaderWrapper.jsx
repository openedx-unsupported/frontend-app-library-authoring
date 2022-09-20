import React from 'react';
import { StudioHeader, ContentTitleBlock } from '@edx/frontend-component-header';
import { connect } from 'react-redux';
import selectLibraryDetail from '../common/data/selectors';
import {
  fetchLibraryDetail,
} from '../author-library/data';
import { injectIntl } from '@edx/frontend-platform/i18n';

// import PropTypes from 'prop-types';

const StudioHeaderWrapperBase = ({...props}) => {
  const { loadingStatus, library } = props;
  
  const actionRowContent = (
    <>
      {(loadingStatus === 'loaded') ? 
          <ContentTitleBlock title="blarg" subtitle="blarg" destination='#'/> :
          <></>
      }
      <div>BLARG</div>
    </>
  );

  return (
    <StudioHeader actionRowContent={actionRowContent}/>
  )
};

// const StudioHeaderWrapper = () => (
//     <StudioHeader actionRowContent={actionRowContent}/>
// );

const StudioHeaderWrapper = connect(
  selectLibraryDetail,
  {
    fetchLibraryDetail,
  },
)(injectIntl(StudioHeaderWrapperBase));

export default StudioHeaderWrapper;
