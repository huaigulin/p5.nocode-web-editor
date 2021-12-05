import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import PreviewFrame from '../components/PreviewFrame';
import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ToastActions from '../actions/toast';
import * as ConsoleActions from '../actions/console';
import { getHTMLFile } from '../reducers/files';
import { getIsUserOwner } from '../selectors/users';
import RootPage from '../../../components/RootPage';
import Dock from '../components/Custom/Dock';

function getTitle(props) {
  const { id } = props.project;
  return id ? `p5.js Web Editor | ${props.project.name}` : 'p5.js Web Editor';
}

function warnIfUnsavedChanges(props, nextLocation) {
  const toAuth =
    nextLocation &&
    nextLocation.action === 'PUSH' &&
    (nextLocation.pathname === '/login' || nextLocation.pathname === '/signup');
  const onAuth =
    nextLocation &&
    (props.location.pathname === '/login' ||
      props.location.pathname === '/signup');
  if (props.ide.unsavedChanges && !toAuth && !onAuth) {
    if (!window.confirm(props.t('Nav.WarningUnsavedChanges'))) {
      return false;
    }
    return true;
  }
  return true;
}

class IDEView extends React.Component {
  constructor(props) {
    super(props);
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);

    this.state = {
      // consoleSize: props.ide.consoleIsExpanded ? 150 : 29
      // sidebarSize: props.ide.sidebarIsExpanded ? 160 : 20
    };
  }

  componentDidMount() {
    // If page doesn't reload after Sign In then we need
    // to force cleared state to be cleared
    this.props.clearPersistedState();

    this.props.stopSketch();
    if (this.props.params.project_id) {
      const { project_id: id, username } = this.props.params;
      if (id !== this.props.project.id) {
        this.props.getProject(id, username);
      }
    }

    this.isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    document.addEventListener('keydown', this.handleGlobalKeydown, false);

    this.props.router.setRouteLeaveHook(
      this.props.route,
      this.handleUnsavedChanges
    );

    // window.onbeforeunload = this.handleUnsavedChanges;
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.autosaveInterval = null;
    const sketchFile = this.props.files.find(
      (file) => file.name === 'sketch.js'
    );
    // try with typing code to draw
    setTimeout(() => {
      console.log('++++++');
      console.log(this.props);
      console.log(sketchFile);
      console.log(this.canvas.offsetWidth);
      this.props.updateFileContent(
        sketchFile.id,
        `function setup() {
        createCanvas(${this.canvas.offsetWidth}, ${this.canvas.offsetHeight});
      }
      
      function draw() {
        background(220);
        circle(20, 20, 20);
      }`
      );
      this.props.startSketch();
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.props.setPreviousPath(this.props.location.pathname);
    }
    // if (this.props.ide.sidebarIsExpanded !== nextProps.ide.sidebarIsExpanded) {
    //   this.setState({
    //     sidebarSize: nextProps.ide.sidebarIsExpanded ? 160 : 20
    //   });
    // }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.params.project_id && !this.props.params.project_id) {
      if (nextProps.params.project_id !== nextProps.project.id) {
        this.props.getProject(nextProps.params.project_id);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isUserOwner && this.props.project.id) {
      if (
        this.props.preferences.autosave &&
        this.props.ide.unsavedChanges &&
        !this.props.ide.justOpenedProject
      ) {
        if (
          this.props.selectedFile.name === prevProps.selectedFile.name &&
          this.props.selectedFile.content !== prevProps.selectedFile.content
        ) {
          if (this.autosaveInterval) {
            clearTimeout(this.autosaveInterval);
          }
          this.autosaveInterval = setTimeout(this.props.autosaveProject, 20000);
        }
      } else if (this.autosaveInterval && !this.props.preferences.autosave) {
        clearTimeout(this.autosaveInterval);
        this.autosaveInterval = null;
      }
    } else if (this.autosaveInterval) {
      clearTimeout(this.autosaveInterval);
      this.autosaveInterval = null;
    }

    if (this.props.route.path !== prevProps.route.path) {
      this.props.router.setRouteLeaveHook(this.props.route, () =>
        warnIfUnsavedChanges(this.props)
      );
    }
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeydown, false);
    clearTimeout(this.autosaveInterval);
    this.autosaveInterval = null;
  }
  handleGlobalKeydown(e) {
    // 83 === s
    if (
      e.keyCode === 83 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (
        this.props.isUserOwner ||
        (this.props.user.authenticated && !this.props.project.owner)
      ) {
        this.props.saveProject(this.cmController.getContent());
      } else if (this.props.user.authenticated) {
        this.props.cloneProject();
      } else {
        this.props.showErrorModal('forceAuthentication');
      }
      // 13 === enter
    } else if (
      e.keyCode === 13 &&
      e.shiftKey &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.props.stopSketch();
    } else if (
      e.keyCode === 13 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.syncFileContent();
      this.props.startSketch();
      // 50 === 2
    } else if (
      e.keyCode === 50 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) &&
      e.shiftKey
    ) {
      e.preventDefault();
      this.props.setAllAccessibleOutput(false);
      // 49 === 1
    } else if (
      e.keyCode === 49 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) &&
      e.shiftKey
    ) {
      e.preventDefault();
      this.props.setAllAccessibleOutput(true);
    } else if (
      e.keyCode === 66 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      if (!this.props.ide.sidebarIsExpanded) {
        this.props.expandSidebar();
      } else {
        this.props.collapseSidebar();
      }
    } else if (e.keyCode === 192 && e.ctrlKey) {
      e.preventDefault();
      if (this.props.ide.consoleIsExpanded) {
        this.props.collapseConsole();
      } else {
        this.props.expandConsole();
      }
    } else if (e.keyCode === 27) {
      if (this.props.ide.newFolderModalVisible) {
        this.props.closeNewFolderModal();
      } else if (this.props.ide.uploadFileModalVisible) {
        this.props.closeUploadFileModal();
      } else if (this.props.ide.modalIsVisible) {
        this.props.closeNewFileModal();
      }
    }
  }

  handleUnsavedChanges = (nextLocation) =>
    warnIfUnsavedChanges(this.props, nextLocation);

  handleBeforeUnload = (e) => {
    const confirmationMessage = this.props.t('Nav.WarningUnsavedChanges');
    if (this.props.ide.unsavedChanges) {
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
    return null;
  };

  syncFileContent = () => {
    const file = this.cmController.getContent();
    this.props.updateFileContent(file.id, file.content);
  };

  render() {
    return (
      <RootPage>
        <main className="editor-preview-container">
          <Grid container>
            <Grid
              item
              style={{ flexGrow: 1 }}
              ref={(canvas) => {
                this.canvas = canvas;
              }}
            >
              <section className="preview-frame-holder">
                {/* <header className="preview-frame__header">
                  <h2 className="preview-frame__title">
                    {this.props.t('Toolbar.Preview')}
                  </h2>
                </header> */}
                <div className="preview-frame__content">
                  <div
                    className="preview-frame-overlay"
                    ref={(element) => {
                      this.overlay = element;
                    }}
                  />
                  <div>
                    {((this.props.preferences.textOutput ||
                      this.props.preferences.gridOutput) &&
                      this.props.ide.isPlaying) ||
                      this.props.ide.isAccessibleOutputPlaying}
                  </div>
                  <PreviewFrame cmController={this.cmController} />
                </div>
              </section>
            </Grid>
            <Grid item style={{ width: 72 }}>
              <Dock />
            </Grid>
          </Grid>
        </main>
      </RootPage>
    );
  }
}

IDEView.propTypes = {
  files: PropTypes.arrayOf.isRequired,
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string,
    reset_password_token: PropTypes.string
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired,
  getProject: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
  saveProject: PropTypes.func.isRequired,
  ide: PropTypes.shape({
    errorType: PropTypes.string,
    keyboardShortcutVisible: PropTypes.bool.isRequired,
    shareModalVisible: PropTypes.bool.isRequired,
    shareModalProjectId: PropTypes.string.isRequired,
    shareModalProjectName: PropTypes.string.isRequired,
    shareModalProjectUsername: PropTypes.string.isRequired,
    previousPath: PropTypes.string.isRequired,
    previewIsRefreshing: PropTypes.bool.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    isAccessibleOutputPlaying: PropTypes.bool.isRequired,
    projectOptionsVisible: PropTypes.bool.isRequired,
    preferencesIsVisible: PropTypes.bool.isRequired,
    modalIsVisible: PropTypes.bool.isRequired,
    uploadFileModalVisible: PropTypes.bool.isRequired,
    newFolderModalVisible: PropTypes.bool.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    sidebarIsExpanded: PropTypes.bool.isRequired,
    consoleIsExpanded: PropTypes.bool.isRequired,
    unsavedChanges: PropTypes.bool.isRequired
  }).isRequired,
  stopSketch: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    }),
    updatedAt: PropTypes.string
  }).isRequired,
  preferences: PropTypes.shape({
    autosave: PropTypes.bool.isRequired,
    fontSize: PropTypes.number.isRequired,
    linewrap: PropTypes.bool.isRequired,
    lineNumbers: PropTypes.bool.isRequired,
    lintWarning: PropTypes.bool.isRequired,
    textOutput: PropTypes.bool.isRequired,
    gridOutput: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    autorefresh: PropTypes.bool.isRequired,
    language: PropTypes.string.isRequired,
    autocloseBracketsQuotes: PropTypes.bool.isRequired
  }).isRequired,
  // closePreferences: PropTypes.func.isRequired,
  // setAutocloseBracketsQuotes: PropTypes.func.isRequired,
  // setFontSize: PropTypes.func.isRequired,
  // setAutosave: PropTypes.func.isRequired,
  // setLineNumbers: PropTypes.func.isRequired,
  // setLinewrap: PropTypes.func.isRequired,
  // setLintWarning: PropTypes.func.isRequired,
  // setTextOutput: PropTypes.func.isRequired,
  // setGridOutput: PropTypes.func.isRequired,
  setAllAccessibleOutput: PropTypes.func.isRequired,
  // files: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     id: PropTypes.string.isRequired,
  //     name: PropTypes.string.isRequired,
  //     content: PropTypes.string.isRequired
  //   })
  // ).isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  // setSelectedFile: PropTypes.func.isRequired,
  htmlFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }).isRequired,
  // newFile: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  // deleteFile: PropTypes.func.isRequired,
  // updateFileName: PropTypes.func.isRequired,
  updateFileContent: PropTypes.func.isRequired,
  // openProjectOptions: PropTypes.func.isRequired,
  // closeProjectOptions: PropTypes.func.isRequired,
  // newFolder: PropTypes.func.isRequired,
  closeNewFolderModal: PropTypes.func.isRequired,
  closeNewFileModal: PropTypes.func.isRequired,
  // closeShareModal: PropTypes.func.isRequired,
  // closeKeyboardShortcutModal: PropTypes.func.isRequired,
  toast: PropTypes.shape({
    isVisible: PropTypes.bool.isRequired
  }).isRequired,
  autosaveProject: PropTypes.func.isRequired,
  router: PropTypes.shape({
    setRouteLeaveHook: PropTypes.func
  }).isRequired,
  route: PropTypes.oneOfType([PropTypes.object, PropTypes.element]).isRequired,
  // setTheme: PropTypes.func.isRequired,
  setPreviousPath: PropTypes.func.isRequired,
  showErrorModal: PropTypes.func.isRequired,
  // hideErrorModal: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  startSketch: PropTypes.func.isRequired,
  // openUploadFileModal: PropTypes.func.isRequired,
  closeUploadFileModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    files: state.files,
    selectedFile:
      state.files.find((file) => file.isSelectedFile) ||
      state.files.find((file) => file.name === 'sketch.js') ||
      state.files.find((file) => file.name !== 'root'),
    htmlFile: getHTMLFile(state.files),
    ide: state.ide,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project,
    toast: state.toast,
    console: state.console,
    isUserOwner: getIsUserOwner(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      EditorAccessibilityActions,
      FileActions,
      ProjectActions,
      IDEActions,
      PreferencesActions,
      UserActions,
      ToastActions,
      ConsoleActions
    ),
    dispatch
  );
}

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(IDEView))
);
