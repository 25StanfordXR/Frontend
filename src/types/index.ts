export interface MapFileInfo {
  kind: 'plz' | 'ply';
  file_name: string;
  url: string;
}

export interface MapMatchResponse {
  map_id: string;
  title: string;
  description: string;
  reasoning?: string | null;
  confidence?: number | null;
  files: MapFileInfo[];
}

export interface ViewerState {
  source: string | null;
  isLoading: boolean;
  error: string | null;
}

export type MatchPhase = 'idle' | 'loading' | 'ready' | 'error';
