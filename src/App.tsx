import { useState, useRef, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import SPZViewer from './components/SPZViewer';
import LoadingSpinner from './components/LoadingSpinner';
import Controls from './components/Controls';
import { ViewerState } from './types';
import './App.css';

function App() {
  const [viewerState, setViewerState] = useState<ViewerState>({
    isLoading: false,
    error: null,
    loadedFile: null,
  });

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const handleLoadUrl = useCallback((url: string) => {
    setViewerState({
      isLoading: true,
      error: null,
      loadedFile: { url },
    });
  }, []);

  const handleLoadFile = useCallback((file: File) => {
    setViewerState({
      isLoading: true,
      error: null,
      loadedFile: { file },
    });
  }, []);

  const handleError = useCallback((error: string) => {
    setViewerState((prev) => ({
      ...prev,
      isLoading: false,
      error,
    }));
  }, []);

  const handleLoadComplete = useCallback(() => {
    setViewerState((prev) => ({
      ...prev,
      isLoading: false,
      error: null,
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (viewerContainerRef.current) {
      const resetFn = (viewerContainerRef.current as any).resetCamera;
      if (resetFn) {
        resetFn();
      }
    }
  }, []);

  const handleClearFile = useCallback(() => {
    setViewerState({
      isLoading: false,
      error: null,
      loadedFile: null,
    });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>SPZ Viewer</h1>
        <p>Gaussian Splatting File Preview powered by Spark.js</p>
      </header>

      <main className="app-main">
        {!viewerState.loadedFile ? (
          <div className="upload-container">
            <FileUpload
              onLoadUrl={handleLoadUrl}
              onLoadFile={handleLoadFile}
              isLoading={viewerState.isLoading}
            />
          </div>
        ) : (
          <div className="viewer-wrapper">
            {viewerState.isLoading && (
              <div className="loading-overlay">
                <LoadingSpinner message="Loading SPZ file..." />
              </div>
            )}

            {viewerState.error && (
              <div className="error-overlay">
                <div className="error-box">
                  <h3>Error</h3>
                  <p>{viewerState.error}</p>
                  <button onClick={handleClearFile}>Go Back</button>
                </div>
              </div>
            )}

            <div ref={viewerContainerRef} className="viewer-container">
              <SPZViewer
                source={viewerState.loadedFile.url || viewerState.loadedFile.file!}
                onError={handleError}
                onLoadComplete={handleLoadComplete}
              />
            </div>

            {!viewerState.isLoading && !viewerState.error && (
              <>
                <Controls onReset={handleReset} />
                <button className="back-button" onClick={handleClearFile}>
                  ← Load Another File
                </button>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with{' '}
          <a href="https://sparkjs.dev" target="_blank" rel="noopener noreferrer">
            Spark.js
          </a>
          {' '}and{' '}
          <a href="https://threejs.org" target="_blank" rel="noopener noreferrer">
            Three.js
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
