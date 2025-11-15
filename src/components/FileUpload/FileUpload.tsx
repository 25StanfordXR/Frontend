import { useState } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onLoadUrl: (url: string) => void;
  onLoadFile: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onLoadUrl, onLoadFile, isLoading }: FileUploadProps) {
  const [url, setUrl] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onLoadUrl(url.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.spz')) {
        alert('Please select a valid SPZ file');
        return;
      }
      onLoadFile(file);
    }
  };

  return (
    <div className="file-upload">
      <h2>Load SPZ File</h2>

      <form onSubmit={handleUrlSubmit} className="url-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter SPZ file URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !url.trim()}>
            Load from URL
          </button>
        </div>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <div className="file-input-wrapper">
        <label htmlFor="file-input" className="file-label">
          {isLoading ? 'Loading...' : 'Choose SPZ File'}
        </label>
        <input
          id="file-input"
          type="file"
          accept=".spz"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
