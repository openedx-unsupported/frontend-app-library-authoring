import React from 'react';
import { StudioHeader } from '@edx/frontend-component-header';
// import PropTypes from 'prop-types';

const actionRowContent = (
  <div>BLARG</div>
);

const StudioHeaderWrapper = () => (
  <StudioHeader contentTitle={"test"} contentSubtitle={"test"} actionRowContent={actionRowContent}/>
);

// EmptyPage.propTypes = {
//   heading: PropTypes.string.isRequired,
//   body: PropTypes.string.isRequired,
//   children: PropTypes.node.isRequired,
// };

export default StudioHeaderWrapper;
