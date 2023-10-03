/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import { v4 as uuid4 } from 'uuid';
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
} from '../data';
import {
  BLOCK_FILTER_ORDER,
  LIBRARY_TYPES,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  fetchable,
  paginated,
} from '../../common';
import {
  updateAllLibraryBlockView,
} from '../../edit-block/data';
import { blockStatesShape } from '../../edit-block/data/shapes';
import commonMessages from '../../common/messages';
import selectLibraryDetail from '../../common/data/selectors';
import AuthoringPage from './AuthoringPage';
import { LoadingPage } from '../../../generic';
import messages from '../messages';

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

/**
 * AuthoringPageContainer
 *
 * Container for the Library Authoring page.
 * This is the main page for the authoring tool.
 */
const AuthoringPageContainer = ({
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
  });

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
    <AuthoringPage
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
      {...props}
    />
  );
};

AuthoringPageContainer.defaultProps = {
  errorMessage: null,
  library: null,
  libraryId: null,
  successMessage: null,
};

AuthoringPageContainer.propTypes = {
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

export default connect(
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
)(injectIntl(AuthoringPageContainer));
