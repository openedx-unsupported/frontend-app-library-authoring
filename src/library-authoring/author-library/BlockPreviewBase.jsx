import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  IconButton,
  Card,
  Dropdown,
  ModalDialog,
  Icon,
  IconButtonWithTooltip,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import {
  EditOutline,
  MoreVert,
  Tag,
} from '@openedx/paragon/icons';
import { EditorPage } from '@edx/frontend-lib-content-components';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { LibraryBlock } from '../edit-block/LibraryBlock';
import {
  getXBlockHandlerUrl,
  libraryBlockShape,
  libraryShape,
  fetchable,
  XBLOCK_VIEW_SYSTEM,
} from '../common';
import messages from './messages';
import { blockViewShape } from '../edit-block/data/shapes';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

const getHandlerUrl = async (blockId) => getXBlockHandlerUrl(blockId, XBLOCK_VIEW_SYSTEM.Studio, 'handler_name');

/**
 * BlockPreviewBase
 * Template component for BlockPreview cards, which are used to display
 * components and render controls for them in a library listing.
 */
export const BlockPreviewBase = ({
  intl, block, view, canEdit, showPreviews, showDeleteModal,
  setShowDeleteModal, showEditorModal, setShowEditorModal, setOpenContentTagsDrawer,
  library, editView, isLtiUrlGenerating,
  ...props
}) => (
  <Card className="w-auto my-3">
    <Card.Header
      className="library-authoring-block-card-header"
      title={block.display_name}
      actions={(
        <ActionRow>
          {
            !!block.tags_count && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="manage-tags-tooltip">{intl.formatMessage(messages['library.detail.block.manage_tags'])}</Tooltip>
                }
              >
                <Button
                  variant="outline-primary"
                  iconBefore={Tag}
                  className="tags-count-manage-button"
                  onClick={() => setOpenContentTagsDrawer(block.id)}
                  data-testid="tags-count-manage-tags-button"
                >
                  { block.tags_count }
                </Button>
              </OverlayTrigger>
            )
          }
          <IconButtonWithTooltip
            aria-label={intl.formatMessage(messages['library.detail.block.edit'])}
            onClick={() => setShowEditorModal(true)}
            src={EditOutline}
            iconAs={Icon}
            tooltipContent={intl.formatMessage(messages['library.detail.block.edit'])}
          />
          <OverlayTrigger
            placement="top"
            overlay={(
              <Tooltip id="more-actions-tooltip">
                {intl.formatMessage(messages['library.detail.block.more_actions'])}
              </Tooltip>
            )}
          >
            <Dropdown>
              <Dropdown.Toggle
                aria-label={intl.formatMessage(messages['library.detail.block.more_actions'])}
                as={IconButton}
                src={MoreVert}
                iconAs={Icon}
              />
              <Dropdown.Menu align="right">
                <Dropdown.Item
                  aria-label={intl.formatMessage(messages['library.detail.block.manage_tags'])}
                  onClick={() => setOpenContentTagsDrawer(block.id)}
                >
                  {intl.formatMessage(messages['library.detail.block.manage_tags'])}
                </Dropdown.Item>
                <Dropdown.Item
                  aria-label={intl.formatMessage(messages['library.detail.block.delete'])}
                  onClick={() => setShowDeleteModal(true)}
                >
                  {intl.formatMessage(messages['library.detail.block.delete'])}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </OverlayTrigger>
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

BlockPreviewBase.propTypes = {
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
  setOpenContentTagsDrawer: PropTypes.func.isRequired,
  updateLibraryBlockView: PropTypes.bool.isRequired,
  view: fetchable(blockViewShape).isRequired,
};

BlockPreviewBase.defaultProps = {
  isLtiUrlGenerating: false,
};

export const BlockPreview = injectIntl(BlockPreviewBase);
