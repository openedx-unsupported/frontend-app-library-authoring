/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Col,
  Container,
  Row,
  Button,
  Card,
  SearchField,
  Form,
  Pagination,
  SelectableBox,
  Icon,
} from '@openedx/paragon';
import {
  Add,
  HelpOutline,
  TextFields,
  VideoCamera,
} from '@openedx/paragon/icons';
import { v4 as uuid4 } from 'uuid';
import { connect } from 'react-redux';
import { ensureConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import {
  clearLibrary,
  clearLibraryError,
  clearLibrarySuccess,
  commitLibraryChanges,
  createBlock,
  fetchBlocks,
  fetchLibraryDetail,
  revertLibraryChanges,
  searchLibrary,
} from './data';
import {
  selectLibraryEdit,
  updateLibrary,
} from '../configure-library/data';
import {
  BLOCK_FILTER_ORDER,
  LIBRARY_TYPES,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  fetchable,
  paginated,
} from '../common';
import { LoadingPage } from '../../generic';
import messages from './messages';
import { BlockPreviewContainerBase } from './BlockPreviewContainerBase';
import ButtonToggles from './ButtonTogglesBase';
import LibraryAuthoringPageHeaderBase from './LibraryAuthoringPageHeaderBase';
import ContentTagsDrawer from './ContentTagsDrawer';
import {
  deleteLibraryBlock,
  fetchLibraryBlockMetadata,
  fetchLibraryBlockView,
  initializeBlock,
  setLibraryBlockDisplayName,
  updateAllLibraryBlockView,
  updateLibraryBlockView,
} from '../edit-block/data';
import { blockStatesShape } from '../edit-block/data/shapes';
import commonMessages from '../common/messages';
import selectLibraryDetail from '../common/data/selectors';
import { ErrorAlert } from '../common/ErrorAlert';
import { SuccessAlert } from '../common/SuccessAlert';
import { LoadGuard } from '../../generic/LoadingPage';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

const BlockPreviewContainer = connect(
  selectLibraryDetail,
  {
    deleteLibraryBlock,
    fetchLibraryBlockView,
    fetchLibraryBlockMetadata,
    initializeBlock,
    setLibraryBlockDisplayName,
    updateLibraryBlockView,
  },
)(injectIntl(BlockPreviewContainerBase));

const deriveTypeOptions = (blockTypes, intl) => {
  let typeOptions = blockTypes.map((typeSpec) => (
    { value: typeSpec.block_type, label: typeSpec.display_name }
  ));

  /* push is commented out until Advanced blocks are allowed as other filter is not neccesary */
  // typeOptions.push({ value: '^', label: intl.formatMessage(messages['library.detail.other_component']) });

  typeOptions = typeOptions.filter((entry) => BLOCK_FILTER_ORDER.includes(entry.value));
  typeOptions.sort((a, b) => {
    const aOrder = BLOCK_FILTER_ORDER.indexOf(a.value);
    const bOrder = BLOCK_FILTER_ORDER.indexOf(b.value);
    if (aOrder === bOrder) {
      // Should never happen, but could cause problems if it did and we didn't indicate they should be treated the same.
      return 0;
    }
    if (BLOCK_FILTER_ORDER.indexOf(a.value) > BLOCK_FILTER_ORDER.indexOf(b.value)) {
      return 1;
    }
    return -1;
  });

  typeOptions.unshift({ value: '', label: intl.formatMessage(messages['library.detail.all_types']) });
  return typeOptions;
};

const LibraryAuthoringPageHeader = connect(
  selectLibraryEdit,
  {
    updateLibrary,
  },
)(injectIntl(LibraryAuthoringPageHeaderBase));

/**
 * LibraryAuthoringPage
 * Template component for the library Authoring page.
 */
export const LibraryAuthoringPageBase = ({
  intl, library, blockView, showPreviews, setShowPreviews,
  sending, addBlock, revertChanges, commitChanges, hasChanges, errorMessage, successMessage,
  quickAddBehavior, otherTypes, blocks, changeQuery, changeType, changePage,
  paginationOptions, typeOptions, query, type, getCurrentViewRange, ...props
}) => {
  const [openContentTagsDrawer, setOpenContentTagsDrawer] = useState('');

  return (
    <Container fluid>
      <header className="mast has-actions">
        <small className="card-subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
        <ActionRow>
          <LibraryAuthoringPageHeader
            library={library}
          />
          <ActionRow.Spacer />
          <ButtonToggles
            setShowPreviews={setShowPreviews}
            showPreviews={showPreviews}
            library={library}
            sending={sending}
            quickAddBehavior={quickAddBehavior}
          />
        </ActionRow>
      </header>
      <Row className="pt-3">
        <ErrorAlert errorMessage={errorMessage} onClose={props.clearLibraryError} />
        <SuccessAlert successMessage={successMessage} onClose={props.clearLibrarySuccess} />
        <Col xs={12} md={8} xl={9}>
          <ActionRow>
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
                className="flex-grow-0 flex-shrink-0 w-25 m-0"
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
          <ActionRow className="my-3">
            <span className="text-primary-500 small">
              {intl.formatMessage(
                messages['library.detail.component.showingCount'],
                {
                  currentViewRange: getCurrentViewRange(paginationOptions.currentPage, blocks.value.count),
                  total: blocks.value.count,
                },
              )}
            </span>
            <ActionRow.Spacer />
            {paginationOptions.pageCount > 1 ? (
              <Pagination
                className="minimal-pagination"
                paginationLabel="pagination navigation"
                variant="minimal"
                currentPage={paginationOptions.currentPage}
                pageCount={paginationOptions.pageCount}
                buttonLabels={paginationOptions.buttonLabels}
                onPageSelect={(page) => changePage(page)}
              />
            ) : null}
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
                setOpenContentTagsDrawer={setOpenContentTagsDrawer}
              />
            ))}
          </LoadGuard>
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
              <Row id="add-component-section" className="bg-light-200 pt-4 pb-4.5 rounded">
                <Col xs={12} className="mb-2">
                  <h3>{intl.formatMessage(messages['library.detail.add_component_heading'])}</h3>
                </Col>
                <Col xs={12} className="text-center">
                  <SelectableBox.Set
                    type="radio"
                    value={null}
                    onChange={(e) => addBlock(e.target.value)}
                    columns={3}
                    ariaLabel="component-selection"
                    name="components"
                    className="px-6 mx-6 text-primary-500"
                    style={{ 'font-weight': 500 }}
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
                    >
                      <Row className="m-0 justify-content-center align-items-center">
                        <Icon
                          src={TextFields}
                          alt={intl.formatMessage(messages['library.detail.add.new.component.html'])}
                          className="mr-2"
                        />
                        <span>{intl.formatMessage(messages['library.detail.add.new.component.html'])}</span>
                      </Row>
                    </SelectableBox>
                    <SelectableBox
                      disabled={sending}
                      value="problem"
                      aria-label="problem-radio"
                    >
                      <Row className="m-0 justify-content-center align-items-center">
                        <Icon
                          src={HelpOutline}
                          alt={intl.formatMessage(messages['library.detail.add.new.component.problem'])}
                          className="mr-2"
                        />
                        <span>{intl.formatMessage(messages['library.detail.add.new.component.problem'])}</span>
                      </Row>
                    </SelectableBox>
                    <SelectableBox
                      disabled={sending}
                      value="video"
                      aria-label="video-radio"
                      className="text-center"
                    >
                      <Row className="m-0 justify-content-center align-items-center">
                        <Icon
                          src={VideoCamera}
                          alt={intl.formatMessage(messages['library.detail.add.new.component.video'])}
                          className="mr-2 text-primary-500"
                        />
                        <span>{intl.formatMessage(messages['library.detail.add.new.component.video'])}</span>
                      </Row>
                    </SelectableBox>
                  </SelectableBox.Set>
                </Col>
              </Row>
            )}
          </Col>
          {paginationOptions.pageCount > 1
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
      <ContentTagsDrawer
        openContentTagsDrawer={openContentTagsDrawer}
        setOpenContentTagsDrawer={setOpenContentTagsDrawer}
      />
    </Container>
  );
};

LibraryAuthoringPageBase.defaultProps = {
  errorMessage: '',
  successMessage: null,
  blocks: null,
};

LibraryAuthoringPageBase.propTypes = {
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
  getCurrentViewRange: PropTypes.func.isRequired,
  otherTypes: PropTypes.arrayOf(
    PropTypes.shape({
      block_type: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

const LibraryAuthoringPage = injectIntl(LibraryAuthoringPageBase);

/**
 * LibraryAuthoringPageContainerBase
 *
 * Container for the Library Authoring page.
 * This is the main page for the authoring tool.
 */
export const LibraryAuthoringPageContainerBase = ({
  intl, library, blockStates, blocks, ...props
}) => {
  const libraryId = useParams().libraryId ?? props.libraryId;
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);

  const pageSize = 20;
  const paginationParams = {
    page,
    page_size: pageSize,
  };

  // On mount.
  useEffect(() => {
    if (!library || (library && library.id !== libraryId)) {
      props.clearLibrary().then(() => {
        props.fetchLibraryDetail({ libraryId });
        props.fetchBlocks({ libraryId, paginationParams });
      });
    }
  }, []);

  const normalizeTypes = () => {
    let types;
    if (type === '^' && library) {
      types = library.blockTypes.map((entry) => entry.block_type);
      types = types.filter((entry) => (entry !== '') && (!BLOCK_FILTER_ORDER.includes(entry)));
      if (types.length === 0) {
        // We're asking for 'other components', but there are no other components. Hand the API something that should
        // return nothing.
        types = ['^'];
      }
    } else if (type === '') {
      types = [];
    } else {
      types = [type];
    }

    return types;
  };

  // Refresh page on query, type, or page changes.
  useEffect(() => {
    if (!sending) {
      props.searchLibrary({
        libraryId, paginationParams, query, types: normalizeTypes(),
      });
    }
  }, [query, type, page]);

  const changeQuery = (newQuery) => {
    // this gets fired when loading/switching paginated pages,
    // so we need to check to make sure the query actually changed
    if (newQuery !== query) {
      setPage(1);
      setQuery(newQuery);
    }
  };

  const changeType = (newType) => {
    setPage(1);
    setType(newType);
  };

  const changePage = (newPage) => {
    setPage(newPage);
  };

  const getCurrentViewRange = (currentPageNumber, totalBlockCount) => {
    const startRange = currentPageNumber * 20 - 19;
    let endRange = currentPageNumber * 20;
    if (endRange > totalBlockCount) {
      endRange = totalBlockCount;
    }
    return `${startRange} - ${endRange}`;
  };

  // If we end up needing this across components, or we end up needing more settings like this, we'll have to create
  // another redux slice for 'common' settings which hydrates from localStorage.
  let initialPreviewState = localStorage.getItem('showPreviews');
  initialPreviewState = initialPreviewState ? JSON.parse(initialPreviewState) : true;
  const [showPreviews, baseSetShowPreviews] = useState(initialPreviewState);
  const setShowPreviews = (value) => {
    localStorage.setItem('showPreviews', value);
    baseSetShowPreviews(value);
  };

  // We need the library to be loaded for what follows.  We can't put this further up because it would change the order
  // of the useState/useEffect hooks on subsequent renders.
  if (!library || !blocks) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }

  const lastPage = Math.ceil(blocks.value.count / pageSize) || 1;

  const addBlock = (blockType) => {
    let nextPage = lastPage;
    if (blocks.value.count && blocks.value.count % pageSize === 0) {
      nextPage += 1;
    }
    setSending(true);
    setPage(nextPage);
    props.createBlock({
      libraryId,
      data: {
        block_type: blockType,
        definition_id: `${uuid4()}`,
      },
      paginationParams: {
        ...paginationParams,
        page: nextPage,
      },
      query,
      types: normalizeTypes(),
    }).finally(() => {
      setSending(false);
    });
  };

  const commitChanges = () => {
    setSending(true);
    props.commitLibraryChanges({ libraryId }).finally(() => {
      setSending(false);
    });
  };

  const revertChanges = () => {
    setSending(true);
    props.revertLibraryChanges({ libraryId, paginationParams }).finally(() => {
      setSending(false);
      props.updateAllLibraryBlockView({ blocks });
    });
  };

  const preSelected = ['video', 'html', 'problem'];
  const otherTypes = (library
    && library.blockTypes.filter((blockSpec) => !preSelected.includes(blockSpec.block_type))
  ) || [];

  const typeOptions = deriveTypeOptions(library.blockTypes, intl);

  const hasChanges = library.has_unpublished_changes || library.has_unpublished_deletes;
  const blockView = (block) => {
    if (blockStates[block.id]) {
      return blockStates[block.id].view;
    }
    return { value: null, status: LOADING_STATUS.STANDBY };
  };

  const quickAddBehavior = () => {
    if (library.type === LIBRARY_TYPES.COMPLEX) {
      document.querySelector('.add-buttons-container').scrollIntoView({ behavior: 'smooth' });
    } else {
      addBlock(library.type);
    }
  };

  const paginationOptions = {
    currentPage: paginationParams.page,
    pageCount: lastPage,
    buttonLabels: {
      previous: intl.formatMessage(commonMessages['library.common.pagination.labels.previous']),
      next: intl.formatMessage(commonMessages['library.common.pagination.labels.next']),
      page: intl.formatMessage(commonMessages['library.common.pagination.labels.page']),
      currentPage: intl.formatMessage(commonMessages['library.common.pagination.labels.currentPage']),
      pageOfCount: intl.formatMessage(commonMessages['library.common.pagination.labels.pageOfCount']),
    },
  };

  return (
    <LibraryAuthoringPage
      blockStates={blockStates}
      blockView={blockView}
      library={library}
      showPreviews={showPreviews}
      setShowPreviews={setShowPreviews}
      sending={sending}
      addBlock={addBlock}
      hasChanges={hasChanges}
      commitChanges={commitChanges}
      revertChanges={revertChanges}
      quickAddBehavior={quickAddBehavior}
      typeOptions={typeOptions}
      paginationOptions={paginationOptions}
      changeQuery={changeQuery}
      changeType={changeType}
      changePage={changePage}
      query={query}
      type={type}
      otherTypes={otherTypes}
      blocks={blocks}
      getCurrentViewRange={getCurrentViewRange}
      {...props}
    />
  );
};

LibraryAuthoringPageContainerBase.defaultProps = {
  errorMessage: null,
  library: null,
  libraryId: null,
  successMessage: null,
};

LibraryAuthoringPageContainerBase.propTypes = {
  blocks: fetchable(paginated(libraryBlockShape)).isRequired,
  blockStates: blockStatesShape.isRequired,
  clearLibrary: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  createBlock: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  fetchBlocks: PropTypes.func.isRequired,
  fetchLibraryDetail: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape,
  libraryId: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  successMessage: PropTypes.string,
  updateAllLibraryBlockView: PropTypes.func.isRequired,
};

const LibraryAuthoringPageContainer = connect(
  selectLibraryDetail,
  {
    clearLibrary,
    clearLibraryError,
    clearLibrarySuccess,
    commitLibraryChanges,
    createBlock,
    fetchBlocks,
    fetchLibraryDetail,
    revertLibraryChanges,
    searchLibrary,
    updateAllLibraryBlockView,
  },
)(injectIntl(LibraryAuthoringPageContainerBase));

export default LibraryAuthoringPageContainer;
