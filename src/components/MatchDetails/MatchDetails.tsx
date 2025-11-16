import { MapFileInfo, MapMatchResponse } from '../../types';
import './MatchDetails.css';

interface MatchDetailsProps {
  prompt: string;
  result: MapMatchResponse | null;
  isLoading: boolean;
}

const formatConfidence = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Unknown';
  }
  return `${Math.round(value * 100)}%`;
};

const hasSplats = (files: MapFileInfo[]): boolean => files.some((file) => file.kind === 'plz');

export default function MatchDetails({ prompt, result, isLoading }: MatchDetailsProps) {
  const files = result?.files ?? [];

  return (
    <section className="match-details">
      <header>
        <p className="match-details__eyebrow">Current Prompt</p>
        <p className="match-details__prompt">{prompt || 'Not yet submitted'}</p>
      </header>

      {isLoading && (
        <div className="match-details__status">Backend is filtering candidate maps…</div>
      )}

      {!result && !isLoading && (
        <div className="match-details__placeholder">
          <h3>Waiting for Match</h3>
          <p>Describe a world, backend returns the closest existing map and its SPZ/PLY resources.</p>
          <ul>
            <li>Include details like environment, time, material</li>
            <li>System provides confidence and LLM reasoning</li>
            <li>Once SPZ/PLZ matches, right side Spark.js loads immediately</li>
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
              Confidence <strong>{formatConfidence(result.confidence)}</strong>
            </div>
          </div>

          <p className="match-details__description">{result.description}</p>

          {result.reasoning && (
            <div className="match-details__reasoning">
              <h4>LLM Commentary</h4>
              <p>{result.reasoning}</p>
            </div>
          )}

          <div className="match-details__render-status">
            <p className="match-details__status-label">Spark.js Rendering</p>
            <p className={`match-details__status-value ${hasSplats(files) ? 'is-ready' : 'is-warning'}`}>
              {hasSplats(files) ? 'Matched SPZ/PLZ resources automatically loaded' : 'Current match missing SPZ/PLZ, cannot render'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
