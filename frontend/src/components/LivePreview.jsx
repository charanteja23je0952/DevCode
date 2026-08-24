import { useState, useEffect } from 'react';
import { EMOJIS, getStatusIcon } from '../constants/emojis';

export default function LivePreview({ 
  isOpen, 
  onClose, 
  previewUrl, 
  status, 
  error, 
  booting,
  onRefresh 
}) {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getLoadingState = () => {
    if (error) return 'error';
    if (booting) return 'booting';
    if (previewUrl) return 'ready';
    return 'idle';
  };

  const getLoadingMessage = () => {
    if (error) return 'Startup failed';
    if (status.frontendStart === 'in-progress') return 'Starting frontend...';
    if (status.backendStart === 'in-progress') return 'Starting backend...';
    if (status.frontendInstall === 'in-progress') return 'Installing frontend dependencies...';
    if (status.backendInstall === 'in-progress') return 'Installing backend dependencies...';
    if (status.mount === 'in-progress') return 'Mounting files...';
    if (booting) return 'Starting...';
    return 'Initializing...';
  };

  const loadingState = getLoadingState();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[85vw] h-[85vh] bg-app-panel rounded-xl shadow-2xl flex flex-col overflow-hidden border border-app-border">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-app-hover border-b border-app-border flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-app-text flex items-center">
              {EMOJIS.PREVIEW} Live Preview
            </span>
            {loadingState === 'booting' && (
              <span className="text-xs text-app-muted ml-2">• {getLoadingMessage()}</span>
            )}
            {loadingState === 'error' && (
              <span className="text-xs text-red-400 ml-2">• Error</span>
            )}
            {loadingState === 'ready' && (
              <span className="text-xs text-green-400 ml-2">• Ready</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loadingState !== 'ready'}
              className="p-2 rounded-lg hover:bg-app-selected text-app-muted hover:text-app-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh"
            >
              {EMOJIS.REFRESH}
            </button>
            <button
              onClick={handleOpenInNewTab}
              disabled={!previewUrl}
              className="p-2 rounded-lg hover:bg-app-selected text-app-muted hover:text-app-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Open in new tab"
            >
              {EMOJIS.OPEN_EXTERNAL}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-app-selected text-app-muted hover:text-app-text transition-colors"
              title="Close"
            >
              {EMOJIS.CLOSE}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {loadingState === 'ready' && previewUrl ? (
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-app-editor">
              {loadingState === 'error' ? (
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">{EMOJIS.ERROR}</div>
                  <h3 className="text-xl font-semibold text-red-400 mb-2">Preview Failed</h3>
                  <p className="text-app-muted mb-4 max-w-md">{error || 'An error occurred while starting the preview'}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                  <p className="text-app-muted">{getLoadingMessage()}</p>
                  
                  {/* Progress indicators */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span>{getStatusIcon(status.mount)}</span>
                      <span className="text-app-muted">Mount files</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span>{getStatusIcon(status.backendInstall)}</span>
                      <span className="text-app-muted">Backend install</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span>{getStatusIcon(status.frontendInstall)}</span>
                      <span className="text-app-muted">Frontend install</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span>{getStatusIcon(status.backendStart)}</span>
                      <span className="text-app-muted">Backend start</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span>{getStatusIcon(status.frontendStart)}</span>
                      <span className="text-app-muted">Frontend start</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}