import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWebContainer } from '../hooks/useWebContainer';
import { getSubmissionById, getSubmissionSnapshot } from '../api/questions';
import FileBrowser from '../components/FileBrowser';
import CodeEditor from '../components/CodeEditor';
import LivePreview from '../components/LivePreview';
import { getStatusIcon, EMOJIS } from '../constants/emojis';

export default function SubmissionView() {
  const { id, submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [snapshotData, setSnapshotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  
  const { webcontainer, status, logs, previewUrl, error: containerError, bootWebContainer, booting, cleanup } = useWebContainer(showPreview ? snapshotData : null);

  useEffect(() => {
    fetchSubmission();
  }, [id, submissionId]);

  useEffect(() => {
    if (showPreview && snapshotData) {
      bootWebContainer();
    }
  }, [showPreview, snapshotData]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const fetchSubmission = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSubmissionById(submissionId);
      setSubmission(response.data.data);

      const snapshotResponse = await getSubmissionSnapshot(submissionId);
      const snapshotData = snapshotResponse.data.data;
      setSnapshotData(snapshotData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch submission');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSubmission = () => {
    setShowPreview(true);
  };

  const handleStopPreview = async () => {
    await cleanup();
    setShowPreview(false);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
        return EMOJIS.JAVASCRIPT;
      case 'ts':
        return EMOJIS.TYPESCRIPT;
      case 'jsx':
      case 'tsx':
        return EMOJIS.REACT;
      case 'json':
        return EMOJIS.JSON;
      case 'css':
        return EMOJIS.CSS;
      case 'html':
        return EMOJIS.HTML;
      case 'md':
        return EMOJIS.MARKDOWN;
      case 'env':
        return EMOJIS.ENV;
      default:
        return EMOJIS.FILE;
    }
  };

  const toggleDirectory = (path) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getStepIcon = (stepStatus) => {
    return getStatusIcon(stepStatus);
  };

  const getStepText = (stepStatus, defaultText) => {
    switch (stepStatus) {
      case 'pending': return defaultText;
      case 'in-progress': return 'In progress...';
      case 'success': return 'Complete';
      case 'error': return 'Failed';
      default: return defaultText;
    }
  };

  const buildFileTreeFromSnapshotTree = (snapshotTree) => {
    return snapshotTree;
  };

  const renderFileTree = (tree, level = 0, parentPath = '') => {
    return Object.entries(tree).map(([name, item]) => {
      const currentPath = parentPath ? `${parentPath}/${name}` : name;
      const paddingLeft = `${level * 16 + 8}px`;
      const isExpanded = expandedDirs.has(currentPath);
      
      if (item.directory) {
        return (
          <div key={currentPath}>
            <div
              className="flex items-center py-1 px-2 cursor-pointer hover:bg-app-hover overflow-hidden"
              style={{ paddingLeft }}
              onClick={() => toggleDirectory(currentPath)}
            >
              <span className="mr-2 flex-shrink-0 text-sm text-indigo-400">
                {isExpanded ? EMOJIS.FOLDER_OPEN : EMOJIS.FOLDER_CLOSED}
              </span>
              <span className="text-sm text-app-text truncate">{name}</span>
            </div>
            {isExpanded && item.directory && renderFileTree(item.directory, level + 1, currentPath)}
          </div>
        );
      } else if (item.file) {
        const fileData = { name, path: currentPath, contents: item.file.contents };
        return (
          <div
            key={currentPath}
            className={`flex items-center py-1 px-2 cursor-pointer hover:bg-app-hover overflow-hidden ${
              selectedFile?.path === currentPath ? 'bg-app-selected' : ''
            }`}
            style={{ paddingLeft }}
            onClick={() => handleFileSelect(fileData)}
          >
            <span className="mr-2 flex-shrink-0 text-sm">{getFileIcon(name)}</span>
            <span className="text-sm text-app-text truncate">{name}</span>
          </div>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div className="bg-app-bg flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-2 text-app-muted">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-app-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full ui-panel p-8">
          <div className="ui-alert-error mb-4">
            {error}
          </div>
          <Link
            to={`/questions/${id}`}
            className="ui-button-primary inline-block"
          >
            Back to Question
          </Link>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const fileTree = snapshotData ? buildFileTreeFromSnapshotTree(snapshotData.tree) : {};

  return (
    <div className="bg-app-bg h-screen flex flex-col overflow-hidden">
      {/* Header - fixed height */}
      <div className="bg-app-panel border-b border-app-border px-4 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              to={`/questions/${id}`}
              className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Question
            </Link>
            <h1 className="text-xl font-bold text-app-text">Submission View (Read-Only)</h1>
          </div>
          <div className="flex items-center space-x-3">
            {!showPreview && (
              <button
                onClick={handleRunSubmission}
                disabled={booting}
                className="ui-button-success"
              >
                {booting ? 'Running...' : 'Run Submission'}
              </button>
            )}
            {showPreview && (
              <>
                <button
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="ui-button-ghost text-sm px-3 py-1"
                >
                  {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
                </button>
                <button
                  onClick={handleStopPreview}
                  disabled={booting}
                  className="ui-button-danger"
                >
                  Stop Preview
                </button>
              </>
            )}
            {!showPreview && previewUrl && (
              <button
                onClick={() => setShowPreview(true)}
                className="ui-button-ghost text-sm px-3 py-1"
              >
                {EMOJIS.PREVIEW} Preview
              </button>
            )}
          </div>
        </div>
        
        {showPreview && (
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <span className="flex items-center space-x-1">
              <span>{getStepIcon(status.mount)}</span>
              <span className="text-app-muted">{getStepText(status.mount, 'Mount')}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>{getStepIcon(status.backendInstall)}</span>
              <span className="text-app-muted">{getStepText(status.backendInstall, 'Backend Install')}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>{getStepIcon(status.frontendInstall)}</span>
              <span className="text-app-muted">{getStepText(status.frontendInstall, 'Frontend Install')}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>{getStepIcon(status.backendStart)}</span>
              <span className="text-app-muted">{getStepText(status.backendStart, 'Backend')}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>{getStepIcon(status.frontendStart)}</span>
              <span className="text-app-muted">{getStepText(status.frontendStart, 'Frontend')}</span>
            </span>
          </div>
        )}
      </div>

      {/* Main content area - takes remaining height */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* File Explorer - fixed width */}
        <div className="w-64 bg-app-panel border-r border-app-border flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-app-border bg-app-hover flex-shrink-0">
            <h3 className="font-semibold text-app-text text-sm">Submitted Files</h3>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
            {Object.keys(fileTree).length > 0 ? (
              renderFileTree(fileTree)
            ) : (
              <div className="text-center text-app-muted text-sm py-4">
                No files submitted
              </div>
            )}
          </div>
        </div>

        {/* Right side - editor and terminal */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Editor - takes available space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {selectedFile ? (
              <div className="h-full flex flex-col bg-app-editor">
                <div className="flex items-center justify-between px-4 py-2 bg-app-hover border-b border-app-border flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-app-muted text-sm">{selectedFile.name}</span>
                    <span className="text-app-muted text-xs">{selectedFile.path}</span>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <CodeEditor 
                    key={selectedFile?.path}
                    file={selectedFile} 
                    webcontainer={null}
                    readOnly={true}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-app-editor text-app-muted">
                <div className="text-center">
                  <div className="text-4xl mb-2">{EMOJIS.FILE}</div>
                  <p>Select a file to view</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Test Output or Terminal */}
          {!showPreview && (
            <div className="h-48 bg-app-editor border-t border-app-border p-4 flex flex-col flex-shrink-0">
              <h3 className="font-semibold text-app-text mb-2">Test Output</h3>
              <div className="ui-panel p-3 flex-1 overflow-hidden flex flex-col">
                {submission.passed ? (
                  <div className="text-green-400 font-medium">{EMOJIS.CHECKMARK} Tests Passed</div>
                ) : (
                  <div className="text-red-400 font-medium">{EMOJIS.CROSS} Tests Failed</div>
                )}
                <pre className="mt-2 text-sm text-app-muted whitespace-pre-wrap overflow-y-auto flex-1">
                  {submission.output || 'No output available'}
                </pre>
              </div>
            </div>
          )}
          
          {showPreview && showTerminal && (
            <div className="h-48 bg-app-editor border-t border-app-border flex flex-col flex-shrink-0 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1 bg-app-hover flex-shrink-0">
                <span className="text-app-muted text-sm">Terminal</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <pre className="p-2 text-green-400 text-sm font-mono overflow-auto whitespace-pre-wrap break-all h-full">
                  {logs || 'Starting...'}
                </pre>
              </div>
            </div>
          )}
          
          {showPreview && !showTerminal && (
            <div className="h-8 bg-app-hover border-t border-app-border flex items-center px-3 flex-shrink-0">
              <span className="text-app-muted text-xs">Terminal (collapsed)</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Modal */}
      <LivePreview
        isOpen={showPreview}
        onClose={handleStopPreview}
        previewUrl={previewUrl}
        status={status}
        error={containerError}
        booting={booting}
        onRefresh={() => {
        }}
      />

      {containerError && !showPreview && (
        <div className="fixed bottom-4 right-4 ui-alert-error shadow-lg max-w-md z-50">
          <strong>Error:</strong> {containerError}
        </div>
      )}
    </div>
  );
}
