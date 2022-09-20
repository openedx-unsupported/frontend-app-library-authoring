import React from 'react';
import { StudioHeader, ContentTitleBlock } from '@edx/frontend-component-header';
// import PropTypes from 'prop-types';

const StudioHeaderWrapper = () => {
  // const { libraryId } = props.match.params;
  
  const actionRowContent = (
    <>
      <ContentTitleBlock title="blarg" subtitle="blarg" destination='#'/>
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

export default StudioHeaderWrapper;
