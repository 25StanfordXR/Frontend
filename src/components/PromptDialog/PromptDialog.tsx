import { FormEvent, useMemo, useState, useEffect } from 'react';
import './PromptDialog.css';

interface PromptDialogProps {
  defaultPrompt?: string;
  isLoading: boolean;
  error?: string | null;
  onSubmit: (prompt: string) => void;
}

const promptSuggestions = [
  'Fog-wrapped cyber port, full of neon and damp steel docks',
  'Mediterranean fortress occupied by vines, dawn sunlight through broken dome',
  'Rock marketplace floating in nebula, low gravity and floating lanterns',
];

export default function PromptDialog({ defaultPrompt = '', isLoading, error, onSubmit }: PromptDialogProps) {
  const [value, setValue] = useState(defaultPrompt);
  const trimmedValue = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    setValue(defaultPrompt);
  }, [defaultPrompt]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedValue || isLoading) {
      return;
    }
    onSubmit(trimmedValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
  };

  return (
    <section className="prompt-dialog" aria-labelledby="prompt-dialog-title">
      <div className="prompt-dialog__header">
        <div>
          <p className="prompt-dialog__eyebrow">World Prompt</p>
          <h2 id="prompt-dialog-title">Describe the space you want</h2>
          <p className="prompt-dialog__hint">The more specific the details, the more credible the matched scene.</p>
        </div>
      </div>

      <form className="prompt-dialog__form" onSubmit={handleSubmit}>
        <label htmlFor="world-prompt" className="sr-only">
          World description
        </label>
        <textarea
          id="world-prompt"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g., Neon alley through haze, puddle reflections flickering"
          disabled={isLoading}
          rows={4}
        />
        <div className="prompt-dialog__actions">
          <button type="submit" disabled={!trimmedValue || isLoading}>
            {isLoading ? 'Matching…' : 'Match World'}
          </button>
          <p className="prompt-dialog__status">Backend: /maps/match</p>
        </div>
      </form>

      {error && <p className="prompt-dialog__error">{error}</p>}

      <div className="prompt-dialog__suggestions">
        <span>Quick examples:</span>
        <div className="prompt-dialog__chips">
          {promptSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="prompt-dialog__chip"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
