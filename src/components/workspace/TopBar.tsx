import type { UiScaleOverride } from '../../hooks/useUiScale';
import type { Theme } from '../../hooks/useTheme';

const TOP_ACTIONS = ['New', 'Open', 'Save'] as const;
const UI_SCALE_OPTIONS: { value: UiScaleOverride; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: '1', label: '100%' },
  { value: '1.1', label: '110%' },
  { value: '1.15', label: '115%' },
  { value: '1.25', label: '125%' },
  { value: '1.5', label: '150%' },
  { value: '1.75', label: '175%' },
];

interface TopBarProps {
  onAction: (action: string) => void;
  uiScale: UiScaleOverride;
  resolvedScale: number;
  onUiScaleChange: (scale: UiScaleOverride) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function TopBar({
  onAction,
  uiScale,
  resolvedScale,
  onUiScaleChange,
  theme,
  onToggleTheme,
}: TopBarProps) {
  const nextThemeLabel = theme === 'night' ? 'Day' : 'Night';
  return (
    <header className="topbar">
      <div className="topbar-title">GIoU Visualiser</div>
      <div className="topbar-controls">
        <label className="ui-scale-control">
          <span className="ui-scale-label">UI</span>
          <select
            className="ui-scale-select"
            value={uiScale}
            onChange={(event) => onUiScaleChange(event.target.value as UiScaleOverride)}
            title={`Current UI scale: ${Math.round(resolvedScale * 100)}%`}
          >
            {UI_SCALE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <nav className="topbar-actions">
          <button
            type="button"
            className="topbar-button topbar-theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${nextThemeLabel.toLowerCase()} mode`}
            title={`Switch to ${nextThemeLabel.toLowerCase()} mode`}
          >
            {nextThemeLabel} mode
          </button>
          {TOP_ACTIONS.map(action => (
            <button
              key={action}
              className="topbar-button"
              onClick={() => onAction(action.toLowerCase())}
            >
              {action}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
