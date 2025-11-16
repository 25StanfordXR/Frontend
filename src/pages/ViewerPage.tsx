import { useCallback, useEffect, useRef, useState } from 'react';
import Controls from '../components/Controls';
import LoadingSpinner from '../components/LoadingSpinner';
import SPZViewer from '../components/SPZViewer';
import PromptDialog from '../components/PromptDialog';
import MatchDetails from '../components/MatchDetails';
import { requestMapMatch, resolveAssetUrl } from '../api/client';
import { MapMatchResponse, MatchPhase, ViewerState, ChunkLODData } from '../types';
import './ViewerPage.css';

const createViewerState = (): ViewerState => ({
  source: null,
  chunks: null,
  isLoading: false,
  error: null,
});

/**
 * Process files array into ChunkLODData structures
 * Groups files by chunk_id and extracts high/low quality pairs
 */
function processChunkedFiles(files: MapMatchResponse['files']): ChunkLODData[] {
  const chunkMap = new Map<string, { high?: string; low?: string; bounds?: ChunkLODData['bounds'] }>();

  // Group files by chunk_id
  for (const file of files) {
    if (!file.chunk_id || !file.lod_level || file.kind !== 'plz') continue;

    const chunkId = file.chunk_id;
    const entry = chunkMap.get(chunkId) || {};

    if (file.lod_level === 'high') {
      entry.high = resolveAssetUrl(file.url);
    } else if (file.lod_level === 'low') {
      entry.low = resolveAssetUrl(file.url);
    }

    if (file.chunk_bounds) {
      entry.bounds = file.chunk_bounds;
    }

    chunkMap.set(chunkId, entry);
  }

  // Convert to ChunkLODData array
  const chunks: ChunkLODData[] = [];
  for (const [chunkId, entry] of chunkMap.entries()) {
    // Both high and low quality required
    if (entry.high && entry.low && entry.bounds) {
      chunks.push({
        chunkId,
        highQualityUrl: entry.high,
        lowQualityUrl: entry.low,
        bounds: entry.bounds,
      });
    }
  }

  return chunks;
}

function ViewerPage() {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<MatchPhase>('idle');
  const [matchResult, setMatchResult] = useState<MapMatchResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>(() => createViewerState());

  const resetCameraRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (!matchResult) {
      setViewerState(createViewerState());
      return;
    }

    // Check if files have chunk metadata (LOD mode)
    const hasChunkData = matchResult.files.some((file) => file.chunk_id && file.lod_level);

    if (hasChunkData) {
      // Process as chunked LOD data
      const chunks = processChunkedFiles(matchResult.files);
      if (chunks.length === 0) {
        setViewerState({
          source: null,
          chunks: null,
          isLoading: false,
          error: 'Match result missing valid chunk data',
        });
        return;
      }

      setViewerState({
        source: null,
        chunks,
        isLoading: true,
        error: null,
      });
    } else {
      // Legacy single file mode
      const splatFile = matchResult.files.find((file) => file.kind === 'plz');
      if (!splatFile) {
        setViewerState({
          source: null,
          chunks: null,
          isLoading: false,
          error: 'Match result missing SPZ/PLZ file',
        });
        return;
      }

      setViewerState({
        source: resolveAssetUrl(splatFile.url),
        chunks: null,
        isLoading: true,
        error: null,
      });
    }
  }, [matchResult]);

  const handlePromptSubmit = useCallback(async (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      setApiError('Description cannot be empty');
      return;
    }

    setPhase('loading');
    setApiError(null);

    try {
      const result = await requestMapMatch(normalized);
      setPrompt(normalized);
      setMatchResult(result);
      setPhase('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Match failed';
      setApiError(message);
      setPhase('error');
    }
  }, []);

  const handleViewerError = useCallback((message: string) => {
    setViewerState((prev) => ({ ...prev, isLoading: false, error: message }));
  }, []);

  const handleViewerReady = useCallback(() => {
    setViewerState((prev) => ({ ...prev, isLoading: false, error: null }));
  }, []);

  const handleReset = useCallback(() => {
    resetCameraRef.current?.();
  }, []);

  const handleRegisterReset = useCallback((reset: () => void) => {
    resetCameraRef.current = reset;
  }, []);

  return (
    <div className="viewer-page">
      <header className="viewer-page-header">
        <div>
          <p className="viewer-page-badge">25XR World Matching Agent</p>
          <h1>Describe the World, Render SPZ Directly</h1>
        </div>
        <p>
          Backend performs lexical filtering then LLM scoring, exposing static SPZ/PLY resources. Frontend converges to one input box + one Spark.js preview window.
        </p>
      </header>

      <main className="viewer-page-main">
        <section className="insights-panel">
          <PromptDialog defaultPrompt={prompt} isLoading={phase === 'loading'} error={apiError} onSubmit={handlePromptSubmit} />
          <MatchDetails prompt={prompt} result={matchResult} isLoading={phase === 'loading'} />
        </section>

        <section className="viewer-panel">
          <div className="viewer-shell">
            {viewerState.source || viewerState.chunks ? (
              <>
                <SPZViewer
                  source={viewerState.source ?? undefined}
                  chunks={viewerState.chunks ?? undefined}
                  onError={handleViewerError}
                  onLoadComplete={handleViewerReady}
                  onRegisterReset={handleRegisterReset}
                />
                {viewerState.isLoading && (
                  <div className="viewer-overlay">
                    <LoadingSpinner message="Loading SPZ resources…" />
                  </div>
                )}
                {viewerState.error && (
                  <div className="viewer-overlay viewer-overlay--error">
                    <p>{viewerState.error}</p>
                  </div>
                )}
                <Controls onReset={handleReset} />
              </>
            ) : (
              <div className="viewer-placeholder">
                <h3>Waiting for SPZ</h3>
                <p>After submitting prompt, matched SPZ/PLZ files will be automatically loaded.</p>
                <ul>
                  <li>Spark.js automatically triggers when result matches</li>
                  <li>Reset Camera returns to initial view</li>
                  <li>VR mode can be entered in bottom right corner</li>
                  <li>LOD system automatically switches quality based on distance</li>
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="viewer-page-footer">
        <p>Spark.js + Three.js · Backend endpoint /maps/match · Static directory /assets</p>
      </footer>
    </div>
  );
}

export default ViewerPage;
