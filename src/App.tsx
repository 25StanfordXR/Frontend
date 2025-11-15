import { useCallback, useEffect, useRef, useState } from 'react';
import Controls from './components/Controls';
import LoadingSpinner from './components/LoadingSpinner';
import SPZViewer from './components/SPZViewer';
import PromptDialog from './components/PromptDialog';
import MatchDetails from './components/MatchDetails';
import { requestMapMatch, resolveAssetUrl } from './api/client';
import { MapMatchResponse, MatchPhase, ViewerState } from './types';
import './App.css';

const createViewerState = (): ViewerState => ({
  source: null,
  isLoading: false,
  error: null,
});

function App() {
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

    const splatFile = matchResult.files.find((file) => file.kind === 'plz');
    if (!splatFile) {
      setViewerState({
        source: null,
        isLoading: false,
        error: '匹配结果缺少 SPZ/PLZ 文件',
      });
      return;
    }

    setViewerState({
      source: resolveAssetUrl(splatFile.url),
      isLoading: true,
      error: null,
    });
  }, [matchResult]);

  const handlePromptSubmit = useCallback(async (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      setApiError('描述不能为空');
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
      const message = error instanceof Error ? error.message : '匹配失败';
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
    <div className="app">
      <header className="app-header">
        <div>
          <p className="app-badge">25XR World Matching Agent</p>
          <h1>描述世界，直接渲染 SPZ</h1>
        </div>
        <p>
          后端先做词法筛选再交给 LLM 打分，并暴露静态 SPZ/PLY 资源。前端收敛为一个输入框 + 一个 Spark.js 预览窗口。
        </p>
      </header>

      <main className="app-main">
        <section className="insights-panel">
          <PromptDialog defaultPrompt={prompt} isLoading={phase === 'loading'} error={apiError} onSubmit={handlePromptSubmit} />
          <MatchDetails prompt={prompt} result={matchResult} isLoading={phase === 'loading'} />
        </section>

        <section className="viewer-panel">
          <div className="viewer-shell">
            {viewerState.source ? (
              <>
                <SPZViewer
                  source={viewerState.source}
                  onError={handleViewerError}
                  onLoadComplete={handleViewerReady}
                  onRegisterReset={handleRegisterReset}
                />
                {viewerState.isLoading && (
                  <div className="viewer-overlay">
                    <LoadingSpinner message="加载 SPZ 资源…" />
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
                <h3>等待 SPZ</h3>
                <p>提交提示词后会自动加载匹配到的 SPZ/PLZ 文件。</p>
                <ul>
                  <li>结果命中后自动触发 Spark.js</li>
                  <li>Reset Camera 用于回到初始视角</li>
                  <li>右下角可进入 VR 模式</li>
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Spark.js + Three.js · 后端接口 /maps/match · 静态目录 /assets</p>
      </footer>
    </div>
  );
}

export default App;
