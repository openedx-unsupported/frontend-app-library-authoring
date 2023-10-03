import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  Card,
  Icon,
  IconButtonWithTooltip,
  ModalDialog,
} from '@edx/paragon';
import { EditOutline, DeleteOutline } from '@edx/paragon/icons';
import { EditorPage } from '@edx/frontend-lib-content-components';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { LibraryBlock } from '../../edit-block/LibraryBlock';
import {
  fetchable,
  getXBlockHandlerUrl,
  libraryBlockShape,
  libraryShape,
  XBLOCK_VIEW_SYSTEM,
} from '../../common';
import { blockViewShape } from '../../edit-block/data/shapes';
import messages from '../messages';

const getHandlerUrl = async (blockId) => getXBlockHandlerUrl(blockId, XBLOCK_VIEW_SYSTEM.Studio, 'handler_name');

/**
 * BlockPreviewBase
 * Template component for BlockPreview cards, which are used to display
 * components and render controls for them in a library listing.
 */

const BlockPreview = ({
  intl, block, view, canEdit, showPreviews, showDeleteModal,
  setShowDeleteModal, showEditorModal, setShowEditorModal, library, editView, isLtiUrlGenerating,
  ...props
}) => (
  <Card className="w-auto m-2">
    <Card.Header
      className="library-authoring-block-card-header"
      title={block.display_name}
      actions={(
        <ActionRow>
          <IconButtonWithTooltip
            aria-label={intl.formatMessage(messages['library.detail.block.edit'])}
            onClick={() => setShowEditorModal(true)}
            src={EditOutline}
            iconAs={Icon}
            tooltipContent={intl.formatMessage(messages['library.detail.block.edit'])}
          />
          <IconButtonWithTooltip
            aria-label={intl.formatMessage(messages['library.detail.block.delete'])}
            onClick={() => setShowDeleteModal(true)}
            src={DeleteOutline}
            iconAs={Icon}
            tooltipContent={intl.formatMessage(messages['library.detail.block.delete'])}
          />
        </ActionRow>
      )}
    />
    <ModalDialog
      isOpen={showEditorModal}
      hasCloseButton={false}
      size="fullscreen"
    >
      <EditorPage
        blockType={block.block_type}
        blockId={block.id}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
        returnFunction={() => (response) => {
          setShowEditorModal(false);
          if (response && response.metadata) {
            props.setLibraryBlockDisplayName({
              blockId: block.id,
              displayName: response.metadata.display_name,
            });
            // This state change triggers the iframe to reload.
            props.updateLibraryBlockView({ blockId: block.id });
          }
        }}
      />
    </ModalDialog>
    <ModalDialog
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages['library.detail.block.delete.modal.title'])}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {intl.formatMessage(messages['library.detail.block.delete.modal.body'])}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages['library.detail.block.delete.modal.cancel.button'])}
          </ModalDialog.CloseButton>
          <Button onClick={() => props.deleteLibraryBlock({ blockId: block.id })} variant="primary">
            {intl.formatMessage(messages['library.detail.block.delete.modal.confirmation.button'])}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
    {showPreviews && (
      <Card.Body>
        <LibraryBlock getHandlerUrl={getHandlerUrl} view={view} />
      </Card.Body>
    )}
  </Card>
);

BlockPreview.propTypes = {
  block: libraryBlockShape.isRequired,
  canEdit: PropTypes.bool.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  editView: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isLtiUrlGenerating: PropTypes.bool,
  library: libraryShape.isRequired,
  setLibraryBlockDisplayName: PropTypes.func.isRequired,
  setShowDeleteModal: PropTypes.func.isRequired,
  setShowEditorModal: PropTypes.func.isRequired,
  showDeleteModal: PropTypes.bool.isRequired,
  showEditorModal: PropTypes.bool.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  updateLibraryBlockView: PropTypes.bool.isRequired,
  view: fetchable(blockViewShape).isRequired,
};

BlockPreview.defaultProps = {
  isLtiUrlGenerating: false,
};

export default injectIntl(BlockPreview);
