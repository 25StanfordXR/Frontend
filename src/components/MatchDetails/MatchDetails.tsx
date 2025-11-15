import { MapFileInfo, MapMatchResponse } from '../../types';
import './MatchDetails.css';

interface MatchDetailsProps {
  prompt: string;
  result: MapMatchResponse | null;
  isLoading: boolean;
}

const formatConfidence = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '未知';
  }
  return `${Math.round(value * 100)}%`;
};

const hasSplats = (files: MapFileInfo[]): boolean => files.some((file) => file.kind === 'plz');

export default function MatchDetails({ prompt, result, isLoading }: MatchDetailsProps) {
  const files = result?.files ?? [];

  return (
    <section className="match-details">
      <header>
        <p className="match-details__eyebrow">当前提示词</p>
        <p className="match-details__prompt">{prompt || '尚未提交'}</p>
      </header>

      {isLoading && (
        <div className="match-details__status">后台正在筛选候选地图…</div>
      )}

      {!result && !isLoading && (
        <div className="match-details__placeholder">
          <h3>等待匹配</h3>
          <p>描述一个世界，后端会返回最接近的已有地图及其 SPZ/PLY 资源。</p>
          <ul>
            <li>包含环境、时间、材质等细节</li>
            <li>系统会给出置信度和 LLM 推理</li>
            <li>一旦命中 SPZ/PLZ，右侧 Spark.js 会立即加载</li>
          </ul>
        </div>
      )}

      {result && (
        <div className="match-details__content">
          <div className="match-details__heading">
            <div>
              <p className="match-details__map-id">#{result.map_id}</p>
              <h3>{result.title}</h3>
            </div>
            <div className="match-details__confidence">
              置信度 <strong>{formatConfidence(result.confidence)}</strong>
            </div>
          </div>

          <p className="match-details__description">{result.description}</p>

          {result.reasoning && (
            <div className="match-details__reasoning">
              <h4>LLM 评语</h4>
              <p>{result.reasoning}</p>
            </div>
          )}

          <div className="match-details__render-status">
            <p className="match-details__status-label">Spark.js 渲染</p>
            <p className={`match-details__status-value ${hasSplats(files) ? 'is-ready' : 'is-warning'}`}>
              {hasSplats(files) ? '已自动加载匹配到的 SPZ/PLZ 资源' : '当前匹配缺少 SPZ/PLZ，无法渲染'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
