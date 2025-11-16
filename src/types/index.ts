export interface MapFileInfo {
  kind: 'plz' | 'ply';
  file_name: string;
  url: string;
  // LOD extensions
  lod_level?: 'high' | 'low';
  chunk_id?: string;
  chunk_bounds?: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

export interface MapMatchResponse {
  map_id: string;
  title: string;
  description: string;
  reasoning?: string | null;
  confidence?: number | null;
  files: MapFileInfo[];
}

export interface ChunkLODData {
  chunkId: string;
  highQualityUrl: string;
  lowQualityUrl: string;
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

export interface ViewerState {
  source: string | null;
  chunks: ChunkLODData[] | null;
  isLoading: boolean;
  error: string | null;
}

export type MatchPhase = 'idle' | 'loading' | 'ready' | 'error';
