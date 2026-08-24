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
    await bootWebContainer();
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
              className="inline-flex items-center text-blue-400 hover:text-blue-300"
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
              className="px-3 py-1 bg-app-hover text-app-text rounded hover:bg-app-selected transition-colors text-sm"
            >
              {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
            </button>
            <button
              onClick={() => setShowLivePreview(true)}
              disabled={!webcontainer && !booting}
              className="px-3 py-1 bg-app-hover text-app-text rounded hover:bg-app-selected transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {EMOJIS.PREVIEW} Preview
            </button>
            <button
              onClick={bootWebContainerWithSave}
              disabled={booting || webcontainer}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booting ? 'Booting...' : isEnvironmentRunning() ? 'Environment Running' : webcontainer ? 'Environment Starting...' : 'Boot Environment'}
            </button>
            {!isReadOnly && (
              <>
                <button
                  onClick={handleRun}
                  disabled={testRunning || !webcontainer}
                  className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testRunning ? 'Running...' : 'Run'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || testRunning || !webcontainer}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed bottom-4 right-4 bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {localTestResult && (
        <div className={`fixed bottom-4 right-4 border px-4 py-3 rounded-lg shadow-lg max-w-lg ${
          localTestResult.passed 
            ? 'bg-green-900/20 border-green-500/50 text-green-400'
            : 'bg-red-900/20 border-red-500/50 text-red-400'
        }`}>
          <strong>
            {localTestResult.passed 
              ? `${EMOJIS.CHECKMARK} Tests PASSED!`
              : `${EMOJIS.CROSS} Tests FAILED`
            }
          </strong>
          {localTestResult.output && (
            <div className="mt-2 bg-app-panel border border-app-border rounded p-2">
              <p className="text-xs font-medium text-app-text mb-1">Test Output:</p>
              <pre className="text-xs text-app-muted whitespace-pre-wrap">{localTestResult.output}</pre>
            </div>
          )}
          <button
            onClick={() => setLocalTestResult(null)}
            className="mt-2 text-sm underline text-app-muted hover:text-app-text"
          >
            Dismiss
          </button>
        </div>
      )}

      {submissionResult && (
        <div className={`fixed bottom-4 right-4 border px-4 py-3 rounded-lg shadow-lg max-w-lg ${
          submissionResult.success 
            ? (submissionResult.passed ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400')
              : 'bg-red-900/20 border-red-500/50 text-red-400'
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
                <div className="mt-2 bg-app-panel border border-app-border rounded p-2">
                  <p className="text-xs font-medium text-app-text mb-1">Test Output:</p>
                  <pre className="text-xs text-app-muted whitespace-pre-wrap">{submissionResult.output}</pre>
                </div>
              )}
              {previewUrl && (
                <button
                  onClick={() => setShowLivePreview(true)}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
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
            className="mt-2 text-sm underline text-app-muted hover:text-app-text"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
