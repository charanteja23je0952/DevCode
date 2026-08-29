import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWebContainer } from '../hooks/useWebContainer';
import { submitSolution } from '../api/questions';
import FileBrowser from '../components/FileBrowser';
import CodeEditor from '../components/CodeEditor';
import LivePreview from '../components/LivePreview';
import { getStatusIcon, EMOJIS } from '../constants/emojis';

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { webcontainer, status, logs, previewUrl, error, bootWebContainer, booting, testRunning, testResults, runTests, getModifiedFiles, cleanup, isReadOnly } = useWebContainer(id);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [localTestResult, setLocalTestResult] = useState(null);
  const [showBootNotice, setShowBootNotice] = useState(false);
  const editorRef = useRef(null);

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

  const isEnvironmentRunning = () => {
    return status.mount === 'success' &&
           status.backendInstall === 'success' &&
           status.frontendInstall === 'success' &&
           status.backendStart === 'success' &&
           status.frontendStart === 'success';
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileSave = () => {
    console.log('File saved');
  };

  const forceSaveCurrentFile = async () => {
    if (editorRef.current && selectedFile) {
      try {
        await editorRef.current.saveCurrentFile();
        console.log('File force-saved');
      } catch (err) {
        console.error('Failed to force save file:', err);
      }
    }
  };

  const bootWebContainerWithSave = async () => {
    await forceSaveCurrentFile();
    setShowBootNotice(true);
    await bootWebContainer();
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (isEnvironmentRunning() || error) {
      setShowBootNotice(false);
    }
  }, [status, error]);

  const handleRun = async () => {
    if (!webcontainer) {
      alert('Please boot the environment first');
      return;
    }

    try {
      setLocalTestResult(null);

      await forceSaveCurrentFile();

      const testResult = await runTests();
      
      setLocalTestResult({
        passed: testResult.passed,
        output: testResult.output || '',
        exitCode: testResult.exitCode
      });
      
    } catch (err) {
      console.error('Run failed:', err);
      setLocalTestResult({
        passed: false,
        output: err.message,
        error: true
      });
    }
  };

  const handleSubmit = async () => {
    if (!webcontainer) {
      alert('Please boot the environment first');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionResult(null);
      setShowLivePreview(false);

      await forceSaveCurrentFile();

      const testResult = await runTests();

      const modifiedFiles = await getModifiedFiles();

      const response = await submitSolution({
        questionId: id,
        passed: testResult.passed,
        submittedFiles: modifiedFiles,
        output: testResult.output || ''
      });
      
      setSubmissionResult({
        success: true,
        passed: testResult.passed,
        output: testResult.output || '',
        data: response.data
      });
      
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmissionResult({
        success: false,
        error: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-xl font-bold text-app-text">
              Workspace {isReadOnly && <span className="text-sm text-app-muted font-normal">(Read-Only)</span>}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className="ui-button-ghost text-sm px-3 py-1"
            >
              {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
            </button>
            <button
              onClick={() => setShowLivePreview(true)}
              disabled={!webcontainer && !booting}
              className="ui-button-ghost text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {EMOJIS.PREVIEW} Preview
            </button>
            <button
              onClick={bootWebContainerWithSave}
              disabled={booting || webcontainer}
              className="ui-button-primary"
            >
              {booting ? 'Booting...' : isEnvironmentRunning() ? 'Environment Ready' : webcontainer ? 'Environment Starting...' : 'Boot Environment'}
            </button>
            {!isReadOnly && (
              <>
                <button
                  onClick={handleRun}
                  disabled={testRunning || !webcontainer}
                  className="ui-button-warning"
                >
                  {testRunning ? 'Running...' : 'Run'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || testRunning || !webcontainer}
                  className="ui-button-success"
                >
                  {submitting ? 'Submitting...' : testRunning ? 'Running Tests...' : 'Submit Solution'}
                </button>
              </>
            )}
          </div>
        </div>
        
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
      </div>

      {/* Main content area - takes remaining height */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* File Explorer - fixed width */}
        <div className="w-64 bg-app-panel border-r border-app-border flex flex-col flex-shrink-0">
          <FileBrowser 
            webcontainer={webcontainer} 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        </div>

        {/* Right side - editor and terminal */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Editor - takes available space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeEditor 
              ref={editorRef}
              file={selectedFile} 
              webcontainer={webcontainer}
              onSave={handleFileSave}
              readOnly={isReadOnly}
            />
          </div>
          
          {/* Terminal - collapsible with fixed height when expanded */}
          {showTerminal ? (
            <div className="h-48 bg-app-editor border-t border-app-border flex flex-col flex-shrink-0 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1 bg-app-hover flex-shrink-0">
                <span className="text-app-muted text-sm">Terminal</span>
              </div>
              <pre className="flex-1 p-2 text-green-400 text-sm font-mono overflow-auto whitespace-pre-wrap break-all">
                {logs || 'Click "Boot Environment" to start...'}
              </pre>
            </div>
          ) : (
            <div className="h-8 bg-app-hover border-t border-app-border flex items-center px-3 flex-shrink-0">
              <span className="text-app-muted text-xs">Terminal (collapsed)</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Modal */}
      <LivePreview
        isOpen={showLivePreview}
        onClose={() => setShowLivePreview(false)}
        previewUrl={previewUrl}
        status={status}
        error={error}
        booting={booting}
        onRefresh={() => {
        }}
      />

      {error && (
        <div className="ui-alert-error fixed bottom-4 right-4 shadow-lg max-w-md z-50">
          <strong>Error:</strong> {error}
        </div>
      )}

      {showBootNotice && (
        <div className="ui-modal-backdrop z-40">
          <div className="ui-panel w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-app-text">Environment Booting</h2>
              <button
                onClick={() => setShowBootNotice(false)}
                className="text-app-muted hover:text-app-text text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-app-muted leading-6">
              The environment is booting. You can read <span className="text-app-text font-medium">README.md</span> and <span className="text-app-text font-medium">challenge.md</span> while it loads. Run your code and tests once the environment is ready.
            </p>
          </div>
        </div>
      )}

      {localTestResult && (
        <div className={`fixed bottom-4 right-4 border px-4 py-3 rounded-lg shadow-lg max-w-lg z-30 ${
          localTestResult.passed 
            ? 'bg-green-500/10 border-green-500/30 text-app-success'
            : 'bg-red-500/10 border-red-500/30 text-app-error'
        }`}>
          <strong>
            {localTestResult.passed 
              ? `${EMOJIS.CHECKMARK} Tests PASSED!`
              : `${EMOJIS.CROSS} Tests FAILED`
            }
          </strong>
          {localTestResult.output && (
            <div className="mt-2 ui-panel p-2">
              <p className="text-xs font-medium text-app-text mb-1">Test Output:</p>
              <pre className="text-xs text-app-muted whitespace-pre-wrap">{localTestResult.output}</pre>
            </div>
          )}
          <button
            onClick={() => setLocalTestResult(null)}
            className="ui-button-ghost text-sm px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {submissionResult && (
        <div className={`fixed bottom-4 right-4 border px-4 py-3 rounded-lg shadow-lg max-w-lg z-30 ${
          submissionResult.success 
            ? (submissionResult.passed ? 'bg-green-500/10 border-green-500/30 text-app-success' : 'bg-yellow-500/10 border-yellow-500/30 text-app-warning')
              : 'bg-red-500/10 border-red-500/30 text-app-error'
        }`}>
          <strong>
            {submissionResult.success 
              ? (submissionResult.passed ? `${EMOJIS.CHECKMARK} Tests PASSED!` : `! Tests FAILED`)
              : `${EMOJIS.CROSS} Submission Failed`
            }
          </strong>
          {submissionResult.success && (
            <>
              <p className="mt-1 text-sm">Your solution has been submitted successfully.</p>
              {submissionResult.output && (
                <div className="mt-2 ui-panel p-2">
                  <p className="text-xs font-medium text-app-text mb-1">Test Output:</p>
                  <pre className="text-xs text-app-muted whitespace-pre-wrap">{submissionResult.output}</pre>
                </div>
              )}
              {previewUrl && (
                <button
                  onClick={() => setShowLivePreview(true)}
                  className="ui-button-primary w-full mt-3"
                >
                  {EMOJIS.PREVIEW} View Live Preview
                </button>
              )}
            </>
          )}
          {submissionResult.error && (
            <p className="mt-1 text-sm">{submissionResult.error}</p>
          )}
          <button
            onClick={() => {
              setSubmissionResult(null);
              setShowLivePreview(false);
            }}
            className="ui-button-ghost text-sm px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
