import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Col,
  Container,
  Row,
  Button,
  Card,
  // Dropdown,
  SearchField,
  Form,
  Pagination,
  SelectableBox,
  Icon,
} from '@edx/paragon';
import {
  Add,
  HelpOutline,
  TextFields,
  VideoCamera,
} from '@edx/paragon/icons';
import { ensureConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  LIBRARY_TYPES,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  fetchable,
  paginated,
} from '../../common';
import messages from '../messages';
import { ErrorAlert } from '../../common/ErrorAlert';
import { SuccessAlert } from '../../common/SuccessAlert';
import { LoadGuard } from '../../../generic/LoadingPage';
import BlockPreviewContainer from '../block-preview';
import TitleHeader from '../title-header';
// import ButtonToggles from './ButtonToggles';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

/**
 * LibraryAuthoringPage
 * Template component for the library Authoring page.
 */
const AuthoringPage = ({
  intl, library, blockView, showPreviews, setShowPreviews,
  sending, addBlock, revertChanges, commitChanges, hasChanges, errorMessage, successMessage,
  quickAddBehavior, otherTypes, blocks, changeQuery, changeType, changePage,
  paginationOptions, typeOptions, query, type, ...props
}) => (
  <Container fluid>
    <TitleHeader
      {...{
        setShowPreviews,
        showPreviews,
        library,
        sending,
        quickAddBehavior,
      }}
    />
    <Row className="pt-3">
      <ErrorAlert errorMessage={errorMessage} onClose={props.clearLibraryError} />
      <SuccessAlert successMessage={successMessage} onClose={props.clearLibrarySuccess} />
      <Col xs={12} md={8} xl={9}>
        <Card>
          <Card.Body>
            <ActionRow className="p-1 pl-2 pt-2">
              {(library.type === LIBRARY_TYPES.COMPLEX) && (
              <>
                <SearchField
                  value={query}
                  placeholder={intl.formatMessage(messages['library.detail.search'])}
                  onSubmit={(value) => changeQuery(value)}
                  onChange={(value) => changeQuery(value)}
                />
                <ActionRow.Spacer />
                <Form.Control
                  className="flex-grow-0 flex-shrink-0 w-25"
                  as="select"
                  data-testid="filter-dropdown"
                  value={type}
                  onChange={(event) => changeType(event.target.value)}
                >
                  {typeOptions.map(typeOption => (
                    <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
                  ))}
                </Form.Control>
              </>
              )}
            </ActionRow>
            {/* todo: figure out how we want to handle these at low screen widths.
                      mobile is currently unsupported: so it doesn't make sense
                      to have partially implemented responsive logic */}
            {/* <Col xs={12} className="text-center d-md-none py-3">
              <ButtonToggles
                setShowPreviews={setShowPreviews}
                showPreviews={showPreviews}
                library={library}
                sending={sending}
                quickAddBehavior={quickAddBehavior}
                className="d-md-none py-3"
              />
            </Col> */}
            <LoadGuard
              loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])}
              condition={blocks.status !== LOADING_STATUS.LOADING}
            >
              {() => blocks.value.data.map((block) => (
                <BlockPreviewContainer
                  key={block.id}
                  block={block}
                  blockView={blockView}
                  showPreviews={showPreviews}
                  library={library}
                />
              ))}
            </LoadGuard>
            {blocks.value.count > 0
              ? (
                <Col xs={12}>
                  <Pagination
                    className="library-blocks-pagination"
                    paginationLabel="pagination navigation"
                    currentPage={paginationOptions.currentPage}
                    pageCount={paginationOptions.pageCount}
                    buttonLabels={paginationOptions.buttonLabels}
                    onPageSelect={(page) => changePage(page)}
                  />
                </Col>
              )
              : null}
            <Col xs={12} className="text-center py-3 library-authoring-block-add-new">
              {library.type !== LIBRARY_TYPES.COMPLEX && (
              <Button
                variant="primary"
                disabled={sending}
                onClick={() => addBlock(library.type)}
                className="cta-button"
                iconBefore={Add}
              >
                {intl.formatMessage(messages[`library.detail.add_${library.type}`])}
              </Button>
              )}
              {library.type === LIBRARY_TYPES.COMPLEX && (
                <Row>
                  <Col xs={12}>
                    <h3>{intl.formatMessage(messages['library.detail.add_component_heading'])}</h3>
                  </Col>
                  <Col xs={12} className="text-center">
                    <SelectableBox.Set
                      type="radio"
                      value={null}
                      onChange={(e) => addBlock(e.target.value)}
                      columns={3}
                      ariaLabel="component-selection"
                      className="px-6"
                      name="components"
                    >
                      {/* Update to use a SelectableBox that triggers a modal for options
                      <div className="d-inline-block">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="success"
                          disabled={sending}
                          className="cta-button mr-2"
                          id="library-detail-add-component-dropdown"
                        >
                          Advanced
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {otherTypes.map((blockSpec) => (
                            <Dropdown.Item
                              onClick={() => addBlock(blockSpec.block_type)}
                              key={blockSpec.block_type}
                            >
                              {blockSpec.display_name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div> */}
                      <SelectableBox
                        disabled={sending}
                        value="html"
                        aria-label="html-radio"
                        className="text-center"
                      >
                        <div className="row m-0 mb-1 justify-content-center">
                          <Icon src={TextFields} />
                        </div>
                        <p>{intl.formatMessage(messages['library.detail.add.new.component.html'])}</p>
                      </SelectableBox>
                      <SelectableBox
                        disabled={sending}
                        value="problem"
                        aria-label="problem-radio"
                        className="text-center"
                      >
                        <div className="row m-0 mb-1 justify-content-center">
                          <Icon src={HelpOutline} />
                        </div>
                        <p>{intl.formatMessage(messages['library.detail.add.new.component.problem'])}</p>
                      </SelectableBox>
                      <SelectableBox
                        disabled={sending}
                        value="video"
                        aria-label="video-radio"
                        className="text-center"
                      >
                        <div className="row m-0  mb-1 justify-content-center">
                          <Icon src={VideoCamera} />
                        </div>
                        <p>{intl.formatMessage(messages['library.detail.add.new.component.video'])}</p>
                      </SelectableBox>
                    </SelectableBox.Set>
                  </Col>
                </Row>
              )}
            </Col>
          </Card.Body>
        </Card>
      </Col>
      <Col className="library-authoring-sidebar" xs={12} md={4} xl={3}>
        <aside>
          <Row>
            <Col xs={12} className="order-1 order-md-0">
              <h4>{intl.formatMessage(messages['library.detail.sidebar.adding.heading'])}</h4>
              <p className="small">{intl.formatMessage(messages['library.detail.sidebar.adding.first'])}</p>
              <p className="small">{intl.formatMessage(messages['library.detail.sidebar.adding.second'])}</p>
              <hr />
              <h4>{intl.formatMessage(messages['library.detail.sidebar.using.heading'])}</h4>
              <p className="small">{intl.formatMessage(messages['library.detail.sidebar.using.first'])}</p>
            </Col>
            <Col xs={12} className="py-3 order-0 order-md-1">
              <Card>
                <Card.Header
                  title={<div className="h4">{intl.formatMessage(messages[`library.detail.aside.${hasChanges ? 'draft' : 'published'}`])}</div>}
                />
                <Card.Footer>
                  <Button block disabled={!hasChanges} onClick={commitChanges} size="sm">
                    {intl.formatMessage(messages['library.detail.aside.publish'])}
                  </Button>
                  <Button variant="tertiary" disabled={!hasChanges} onClick={revertChanges} size="sm">
                    {intl.formatMessage(messages['library.detail.aside.discard'])}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </aside>
      </Col>
    </Row>
  </Container>
);

AuthoringPage.defaultProps = {
  errorMessage: '',
  successMessage: null,
  blocks: null,
};

AuthoringPage.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  blocks: fetchable(paginated(libraryBlockShape)),
  blockView: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  paginationOptions: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    buttonLabels: PropTypes.shape({
      previous: PropTypes.string.isRequired,
      next: PropTypes.string.isRequired,
      page: PropTypes.string.isRequired,
      currentPage: PropTypes.string.isRequired,
      pageOfCount: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  changeQuery: PropTypes.func.isRequired,
  changeType: PropTypes.func.isRequired,
  changePage: PropTypes.func.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
  typeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  sending: PropTypes.bool.isRequired,
  addBlock: PropTypes.func.isRequired,
  hasChanges: PropTypes.bool.isRequired,
  revertChanges: PropTypes.func.isRequired,
  commitChanges: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  clearLibraryError: PropTypes.func.isRequired,
  clearLibrarySuccess: PropTypes.func.isRequired,
  quickAddBehavior: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  otherTypes: PropTypes.arrayOf(
    PropTypes.shape({
      block_type: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default injectIntl(AuthoringPage);
