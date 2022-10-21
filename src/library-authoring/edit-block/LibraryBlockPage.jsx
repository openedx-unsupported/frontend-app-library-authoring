import React from 'react';
import {
  NavLink, Switch, Route, withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Spinner, Alert } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import {
  BLOCK_TYPE_EDIT_DENYLIST,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  ROUTES,
  truncateMessage,
  XBLOCK_VIEW_SYSTEM,
  getXBlockHandlerUrl, fetchable,
} from '../common';
import {
  commitLibraryChanges,
  fetchLibraryDetail,
  revertLibraryChanges,
} from '../author-library';
import {
  clearLibraryBlockError,
  deleteLibraryBlock,
  deleteLibraryBlockAsset,
  fetchLibraryBlockAssets,
  fetchLibraryBlockMetadata,
  fetchLibraryBlockOlx,
  fetchLibraryBlockView,
  libraryBlockInitialState,
  selectLibraryBlock,
  setLibraryBlockError,
  setLibraryBlockOlx,
  uploadLibraryBlockAssets,
  focusBlock, initializeBlock,
} from './data';
import { LibraryBlock } from './LibraryBlock';
import LibraryBlockAssets from './LibraryBlockAssets';
import LibraryBlockOlx from './LibraryBlockOlx';

import messages from './messages';

import { blockViewShape } from './data/shapes';

class LibraryBlockPage extends React.Component {
  componentDidMount() {
    this.loadData();
    /* This is required if the user reached the page directly. */
    if (this.props.library === null) {
      const { libraryId } = this.props.match.params;
      this.props.fetchLibraryDetail({ libraryId });
    }
    this.props.initializeBlock(this.props.match.params.blockId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.path !== prevProps.match.path) {
      this.loadData();
    }
  }

  get isEditable() {
    const { metadata } = this.props;
    return metadata !== null && !BLOCK_TYPE_EDIT_DENYLIST.includes(this.props.metadata.block_type);
  }

  /**
   * Helper method which gets a "secure handler URL" from the LMS/Studio
   * A "secure handler URL" is a URL that the XBlock runtime can use even from
   * within its sandboxed IFrame. (The IFrame is considered a different origin,
   * and normally, cross-origin handler requests would be blocked).
   *
   * @param usageKey The usage key of the XBlock whose handlers you want to call.
   */
  getHandlerUrl = async (usageKey) => {
    const viewSystem = (
      this.props.match.path === ROUTES.Block.Learn
        ? XBLOCK_VIEW_SYSTEM.LMS
        : XBLOCK_VIEW_SYSTEM.Studio
    );
    return getXBlockHandlerUrl(usageKey, viewSystem, 'handler_name');
  }

  handleBlockNotification = (event) => {
    if (
      event.eventType === 'cancel'
      || (event.eventType === 'save' && event.state === 'end')
    ) {
      const { libraryId, blockId } = this.props.match.params;
      this.props.history.push(ROUTES.Block.HOME_SLUG(libraryId, blockId));
    } else if (event.eventType === 'error') {
      const { blockId } = this.props.match.params;
      const errorMessage = `${event.title || 'Error'}: ${event.message}`;
      this.props.setLibraryBlockError({ errorMessage, blockId });
    } else {
      logError(`Unknown XBlock runtime event: ${event}`);
    }
  }

  handleDeleteBlock = () => {
    const { blockId } = this.props.match.params;
    /* eslint-disable-next-line no-alert */
    if (window.confirm('Are you sure you want to delete this XBlock? There is no undo.')) {
      this.props.deleteLibraryBlock({ blockId }).then(() => {
        this.props.history.push(ROUTES.Detail.HOME_SLUG(this.props.match.params.libraryId));
      });
    }
  }

  handleSaveOlx = (olx) => {
    const { blockId } = this.props.match.params;
    this.props.setLibraryBlockOlx({ blockId, olx });
  }

  handleDropFiles = (files) => {
    const { blockId } = this.props.match.params;
    this.props.uploadLibraryBlockAssets({ blockId, files });
  }

  handleDeleteFile = (fileName) => {
    const { blockId } = this.props.match.params;
    /* eslint-disable-next-line no-alert */
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      this.props.deleteLibraryBlockAsset({ blockId, fileName });
    }
  }

  handleCommitLibrary = async () => {
    const { blockId, libraryId } = this.props.match.params;
    await this.props.commitLibraryChanges({ libraryId });

    /* We fetch block metadata immediately, as its published status may have changed. */
    this.props.fetchLibraryBlockMetadata({ blockId });
  }

  handleRevertLibrary = async () => {
    const { blockId, libraryId } = this.props.match.params;
    await this.props.revertLibraryChanges({ libraryId });

    /* We fetch block metadata immediately, as its publication status may have changed. */
    this.props.fetchLibraryBlockMetadata({ blockId });
  }

  handleDismissAlert = () => {
    this.props.clearLibraryBlockError();
  }

  loadData() {
    const { blockId } = this.props.match.params;
    this.props.focusBlock({ blockId });

    /* Always load block metadata. */
    this.props.fetchLibraryBlockMetadata({ blockId });

    switch (this.props.match.path) {
      case ROUTES.Block.HOME: {
        this.props.fetchLibraryBlockView({
          blockId,
          viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
          viewName: 'student_view',
        });
        break;
      }
      case ROUTES.Block.EDIT: {
        this.props.fetchLibraryBlockView({
          blockId,
          viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
          viewName: 'studio_view',
        });
        break;
      }
      case ROUTES.Block.SOURCE: {
        this.props.fetchLibraryBlockOlx({ blockId });
        break;
      }
      case ROUTES.Block.ASSETS: {
        this.props.fetchLibraryBlockAssets({ blockId });
        break;
      }
      case ROUTES.Block.LEARN: {
        this.props.fetchLibraryBlockView({
          blockId,
          viewSystem: XBLOCK_VIEW_SYSTEM.LMS,
          viewName: 'student_view',
        });
        break;
      }
      default:
    }
  }

  renderContent() {
    const {
      errorMessage,
      intl,
      metadata,
    } = this.props;
    const { blockId, libraryId } = this.props.match.params;
    const hasChanges = metadata ? metadata.has_unpublished_changes : false;

    return (
      <div className="library-block-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions has-navigation has-subtitle">
            <div className="page-header">
              <Button href={ROUTES.Detail.HOME_SLUG(libraryId)} className="my-1" size="sm">
                <FontAwesomeIcon icon={faArrowLeft} className="pr-1" />
                {intl.formatMessage(messages['library.block.page.back_to_library'])}
              </Button>
              <small className="subtitle">{intl.formatMessage(messages['library.block.page.heading'])}</small>
              <h2 className="page-header-title">{metadata !== null && metadata.display_name}</h2>
            </div>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
              {errorMessage
              && (
              <Alert
                variant="danger"
                onClose={this.handleDismissAlert}
                dismissible
              >
                {truncateMessage(errorMessage)}
              </Alert>
              )}
              <div className="card">
                <div className="card-header">
                  <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                      <NavLink exact to={ROUTES.Block.HOME_SLUG(libraryId, blockId)} className="nav-link" activeClassName="active">View</NavLink>
                    </li>
                    <li className="nav-item">
                      {this.isEditable
                        ? <NavLink to={ROUTES.Block.EDIT_SLUG(libraryId, blockId)} className="nav-link" activeClassName="active">Edit</NavLink>
                        : <span className="nav-link">Edit</span>}
                    </li>
                    <li className="nav-item">
                      <NavLink to={ROUTES.Block.ASSETS_SLUG(libraryId, blockId)} className="nav-link" activeClassName="active">Assets</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to={ROUTES.Block.SOURCE_SLUG(libraryId, blockId)} className="nav-link" activeClassName="active">Source</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to={ROUTES.Block.LEARN_SLUG(libraryId, blockId)} className="nav-link" activeClassName="active">Learn</NavLink>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  { this.props.view.status === LOADING_STATUS.LOADING ? (
                    <div
                      className="d-flex justify-content-center align-items-center flex-column"
                      style={{ height: '400px' }}
                    >
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : (
                    <Switch>
                      <Route exact path={ROUTES.Block.HOME}>
                        <LibraryBlock
                          view={this.props.view}
                          getHandlerUrl={this.getHandlerUrl}
                        />
                      </Route>
                      <Route exact path={ROUTES.Block.EDIT}>
                        <LibraryBlock
                          view={this.props.view}
                          getHandlerUrl={this.getHandlerUrl}
                          onBlockNotification={this.handleBlockNotification}
                        />
                      </Route>
                      <Route exact path={ROUTES.Block.ASSETS}>
                        <LibraryBlockAssets
                          assets={this.props.assets}
                          onDropFiles={this.handleDropFiles}
                          onDeleteFile={this.handleDeleteFile}
                        />
                      </Route>
                      <Route exact path={ROUTES.Block.SOURCE}>
                        <LibraryBlockOlx
                          olx={this.props.olx}
                          onSaveOlx={this.handleSaveOlx}
                        />
                      </Route>
                      <Route exact path={ROUTES.Block.LEARN}>
                        <p>
                          This tab uses the LMS APIs so it shows the published version only and will save user state.
                        </p>
                        <LibraryBlock
                          view={this.props.view}
                          getHandlerUrl={this.getHandlerUrl}
                        />
                      </Route>
                    </Switch>
                  )}
                </div>
              </div>
            </article>
            <aside className="content-supplementary">
              <div className="bit">
                <h3 className="title title-3">{intl.formatMessage(messages['library.block.aside.title'])}</h3>
                <p>{intl.formatMessage(messages['library.block.aside.text.1'])}</p>
                <ul className="list-actions">
                  <li className="action-item">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {intl.formatMessage(messages['library.block.aside.help.link'])}
                    </a>
                  </li>
                </ul>
              </div>
              <div id="publish-unit" className="window">
                <div className={`bit-publishing ${hasChanges && 'has-warnings'}`}>
                  <h4 className="bar-mod-title pub-status h4">
                    {intl.formatMessage(messages[`library.block.aside.${hasChanges ? 'draft' : 'published'}`])}
                  </h4>
                  <div className="wrapper-pub-actions bar-mod-actions">
                    <ul className="action-list list-unstyled">
                      <li className="action-item">
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-100 p-2"
                          onClick={this.handleCommitLibrary}
                          disabled={!hasChanges}
                          aria-disabled={!hasChanges}
                        >
                          <strong>{intl.formatMessage(messages['library.block.aside.publish'])}</strong>
                        </Button>
                      </li>
                      <li className="action-item text-right">
                        <Button
                          size="sm"
                          variant="link"
                          className="d-inline-block"
                          onClick={this.handleRevertLibrary}
                          disabled={!hasChanges}
                          aria-disabled={!hasChanges}
                        >
                          {intl.formatMessage(messages['library.block.aside.discard'])}
                        </Button>
                      </li>
                      <li className="action-item">
                        <Button
                          size="sm"
                          variant="danger"
                          className="w-100 p-2"
                          onClick={this.handleDeleteBlock}
                        >
                          <strong>{intl.formatMessage(messages['library.block.aside.delete'])}</strong>
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="container-fluid">
        {this.renderContent()}
      </div>
    );
  }
}

LibraryBlockPage.contextType = AppContext;

LibraryBlockPage.propTypes = {
  assets: fetchable(PropTypes.arrayOf(PropTypes.object)),
  clearLibraryBlockError: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  deleteLibraryBlockAsset: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  fetchLibraryBlockAssets: PropTypes.func.isRequired,
  fetchLibraryBlockMetadata: PropTypes.func.isRequired,
  fetchLibraryBlockOlx: PropTypes.func.isRequired,
  fetchLibraryBlockView: PropTypes.func.isRequired,
  fetchLibraryDetail: PropTypes.func.isRequired,
  initializeBlock: PropTypes.func.isRequired,
  focusBlock: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  intl: intlShape.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
      blockId: PropTypes.string.isRequired,
    }).isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
  library: libraryShape,
  metadata: fetchable(libraryBlockShape).isRequired,
  olx: fetchable(PropTypes.string).isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  setLibraryBlockOlx: PropTypes.func.isRequired,
  setLibraryBlockError: PropTypes.func.isRequired,
  uploadLibraryBlockAssets: PropTypes.func.isRequired,
  view: fetchable(blockViewShape).isRequired,
};

LibraryBlockPage.defaultProps = libraryBlockInitialState;

export default connect(
  selectLibraryBlock,
  {
    focusBlock,
    clearLibraryBlockError,
    commitLibraryChanges,
    deleteLibraryBlock,
    deleteLibraryBlockAsset,
    fetchLibraryBlockAssets,
    fetchLibraryBlockMetadata,
    fetchLibraryBlockOlx,
    fetchLibraryBlockView,
    fetchLibraryDetail,
    revertLibraryChanges,
    setLibraryBlockOlx,
    setLibraryBlockError,
    uploadLibraryBlockAssets,
    initializeBlock,
  },
)(injectIntl(withRouter(LibraryBlockPage)));
