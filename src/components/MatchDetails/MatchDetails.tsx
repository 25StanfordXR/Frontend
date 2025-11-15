import { MapFileInfo, MapMatchResponse } from '../../types';
import { resolveAssetUrl } from '../../api/client';
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
            <li>文件在 /assets 静态目录，可直接下载</li>
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

          <div className="match-details__files">
            <div className="match-details__files-heading">
              <h4>可用文件</h4>
              {!hasSplats(files) && (
                <span className="match-details__warning">缺少 SPZ/PLZ 文件，无法即时预览</span>
              )}
            </div>
            <ul>
              {files.map((file) => (
                <li key={`${file.kind}-${file.file_name}`}>
                  <div>
                    <p className="match-details__file-name">{file.file_name}</p>
                    <span className="match-details__file-kind">.{file.kind}</span>
                  </div>
                  <a href={resolveAssetUrl(file.url)} target="_blank" rel="noreferrer">
                    下载
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
