export interface SPZFile {
  url?: string;
  file?: File;
}

export interface ViewerState {
  isLoading: boolean;
  error: string | null;
  loadedFile: SPZFile | null;
}

export type LoadSource = 'url' | 'file';
