import './Controls.css';

interface ControlsProps {
  onReset: () => void;
}

export default function Controls({ onReset }: ControlsProps) {
  return (
    <div className="controls">
      <button onClick={onReset} className="reset-button">
        Reset Camera
      </button>
      <div className="instructions">
        <p><strong>Controls:</strong></p>
        <ul>
          <li>Left Click + Drag: Rotate</li>
          <li>Right Click + Drag: Pan</li>
          <li>Scroll: Zoom</li>
        </ul>
      </div>
    </div>
  );
}
