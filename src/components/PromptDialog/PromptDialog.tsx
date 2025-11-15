import { FormEvent, useMemo, useState, useEffect } from 'react';
import './PromptDialog.css';

interface PromptDialogProps {
  defaultPrompt?: string;
  isLoading: boolean;
  error?: string | null;
  onSubmit: (prompt: string) => void;
}

const promptSuggestions = [
  '雾气缭绕的赛博港口，充满霓虹和潮湿的钢铁栈桥',
  '被藤蔓占领的地中海古堡，黎明阳光透过破碎穹顶',
  '漂浮在星云中的岩石集市，低重力和悬浮灯笼',
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
          <h2 id="prompt-dialog-title">描述你想要的空间</h2>
          <p className="prompt-dialog__hint">细节越具体，匹配到的场景越可信。</p>
        </div>
      </div>

      <form className="prompt-dialog__form" onSubmit={handleSubmit}>
        <label htmlFor="world-prompt" className="sr-only">
          世界描述
        </label>
        <textarea
          id="world-prompt"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="例如：穿过雾霾的霓虹巷子，水洼倒影闪烁"
          disabled={isLoading}
          rows={4}
        />
        <div className="prompt-dialog__actions">
          <button type="submit" disabled={!trimmedValue || isLoading}>
            {isLoading ? '匹配中…' : '匹配世界'}
          </button>
          <p className="prompt-dialog__status">后端：/maps/match</p>
        </div>
      </form>

      {error && <p className="prompt-dialog__error">{error}</p>}

      <div className="prompt-dialog__suggestions">
        <span>快速示例：</span>
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
