/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { intlShape } from '@edx/frontend-platform/i18n';
import { BlockPreview } from './BlockPreviewBase';
import {
  BLOCK_TYPE_EDIT_DENYLIST,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  ROUTES,
  XBLOCK_VIEW_SYSTEM,
  fetchable,
} from '../common';
import { LoadingPage } from '../../generic';
import messages from './messages';
import { blockStatesShape } from '../edit-block/data/shapes';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

const inStandby = ({ blockStates, id, attr }) => blockStates[id][attr].status === LOADING_STATUS.STANDBY;
const needsView = ({ blockStates, id }) => inStandby({ blockStates, id, attr: 'view' });
const needsMeta = ({ blockStates, id }) => inStandby({ blockStates, id, attr: 'metadata' });

/**
 * BlockPreviewContainerBase
 * Container component for the BlockPreview cards.
 * Handles the fetching of the block view and metadata.
 */
export const BlockPreviewContainerBase = ({
  intl, block, blockView, blockStates, showPreviews, setOpenContentTagsDrawer, library, ltiUrlClipboard, ...props
}) => {
  // There are enough events that trigger the effects here that we need to keep track of what we're doing to avoid
  // doing it more than once, or running them when the state can no longer support these actions.
  //
  // This problem feels like there should be some way to generalize it and wrap it to avoid this issue.
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);

  useEffect(() => {
    props.initializeBlock({
      blockId: block.id,
    });
  }, []);
  useEffect(() => {
    if (!blockStates[block.id] || !showPreviews) {
      return;
    }
    if (needsMeta({ blockStates, id: block.id })) {
      props.fetchLibraryBlockMetadata({ blockId: block.id });
    }
    if (needsView({ blockStates, id: block.id })) {
      props.fetchLibraryBlockView({
        blockId: block.id,
        viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
        viewName: 'student_view',
      });
    }
  }, [blockStates[block.id], showPreviews]);

  if (blockStates[block.id] === undefined) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }
  const { metadata } = blockStates[block.id];
  const canEdit = metadata !== null && !BLOCK_TYPE_EDIT_DENYLIST.includes(metadata.block_type);

  let editView;
  if (canEdit) {
    editView = ROUTES.Block.EDIT_SLUG(library.id, block.id);
  } else {
    editView = ROUTES.Detail.HOME_SLUG(library.id, block.id);
  }

  let isLtiUrlGenerating;
  if (library.allow_lti) {
    const isBlockOnClipboard = ltiUrlClipboard.value.blockId === block.id;
    isLtiUrlGenerating = isBlockOnClipboard && ltiUrlClipboard.status === LOADING_STATUS.LOADING;

    if (isBlockOnClipboard && ltiUrlClipboard.status === LOADING_STATUS.LOADED) {
      const clipboard = document.createElement('textarea');
      clipboard.value = getConfig().STUDIO_BASE_URL + ltiUrlClipboard.value.lti_url;
      document.body.appendChild(clipboard);
      clipboard.select();
      document.execCommand('copy');
      document.body.removeChild(clipboard);
    }
  }

  return (
    <BlockPreview
      block={block}
      canEdit={canEdit}
      editView={editView}
      isLtiUrlGenerating={isLtiUrlGenerating}
      library={library}
      setShowDeleteModal={setShowDeleteModal}
      setShowEditorModal={setShowEditorModal}
      showDeleteModal={showDeleteModal}
      showEditorModal={showEditorModal}
      showPreviews={showPreviews}
      setOpenContentTagsDrawer={setOpenContentTagsDrawer}
      view={blockView(block)}
      {...props}
    />
  );
};

BlockPreviewContainerBase.defaultProps = {
  blockView: null,
  ltiUrlClipboard: null,
};

BlockPreviewContainerBase.propTypes = {
  block: libraryBlockShape.isRequired,
  blockStates: blockStatesShape.isRequired,
  blockView: PropTypes.func,
  fetchLibraryBlockView: PropTypes.func.isRequired,
  fetchLibraryBlockMetadata: PropTypes.func.isRequired,
  initializeBlock: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  ltiUrlClipboard: fetchable(PropTypes.object),
  showPreviews: PropTypes.bool.isRequired,
  setOpenContentTagsDrawer: PropTypes.func.isRequired,
};

export const BlockPreviewContainer = BlockPreviewContainerBase;
