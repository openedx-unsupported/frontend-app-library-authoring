import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

const ContentTagsDrawer = ({ openContentTagsDrawer, setOpenContentTagsDrawer }) => {
  const iFrameRef = useRef();

  if (openContentTagsDrawer) {
    document.body.classList.add('drawer-open');
  } else {
    document.body.classList.remove('drawer-open');
  }

  useEffect(() => {
    const handleCloseMessage = (event) => {
      if (event.data === 'closeManageTagsDrawer') {
        setOpenContentTagsDrawer('');
      }
    };

    const handleCloseEsc = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setOpenContentTagsDrawer('');
      }
    };

    // Add event listener to close drawer when close button is clicked or ESC pressed
    // from within the Iframe
    window.addEventListener('message', handleCloseMessage);
    // Add event listener to close the drawer when ESC pressed and focus outside iframe
    // If ESC is pressed while the Iframe is in focus, it will send the close message
    // to the parent window and it will be handled with the above event listener
    window.addEventListener('keyup', handleCloseEsc);

    return () => {
      window.removeEventListener('message', handleCloseMessage);
      window.removeEventListener('keyup', handleCloseEsc);
    };
  }, [setOpenContentTagsDrawer]);

  useEffect(() => {
    if (openContentTagsDrawer && iFrameRef.current) {
      iFrameRef.current.focus();
    }
  }, [openContentTagsDrawer]);

  // TODO: The use of an iframe in the implementation will likely change
  const renderIFrame = () => (
    <iframe
      ref={iFrameRef}
      title="manage-tags-drawer"
      className="w-100 h-100 border-0"
      src={`${getConfig().COURSE_AUTHORING_MICROFRONTEND_URL}/tagging/components/widget/${openContentTagsDrawer}`}
    />
  );

  return openContentTagsDrawer && (
    <>
      <div id="manage-tags-drawer" className="drawer">
        { renderIFrame() }
      </div>
      <div className="drawer-cover" />
    </>
  );
};

ContentTagsDrawer.propTypes = {
  openContentTagsDrawer: PropTypes.string.isRequired,
  setOpenContentTagsDrawer: PropTypes.func.isRequired,
};

export default ContentTagsDrawer;
