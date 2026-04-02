import React, { useState } from 'react';
import type { CuboidPanelProps, TransformMode } from '../types/Cuboid.ts';

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];

const MODES: { key: TransformMode; label: string; shortcut: string }[] = [
  { key: 'translate', label: 'Move', shortcut: 'W' },
  { key: 'rotate', label: 'Rotate', shortcut: 'E' },
  { key: 'scale', label: 'Scale', shortcut: 'R' },
];

export function CuboidPanel({ cuboids, selectedId, mode, onAdd, onDelete, onSelect, onModeChange }: CuboidPanelProps) {
  const [width, setWidth] = useState('1');
  const [height, setHeight] = useState('1');
  const [depth, setDepth] = useState('1');
  const [color, setColor] = useState(COLORS[0]);

  const handleAdd = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const d = parseFloat(depth);
    if (w > 0 && h > 0 && d > 0) {
      onAdd({ width: w, height: h, depth: d, color });
    }
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Cuboid Manager</h3>

      <div style={styles.modeRow}>
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => onModeChange(m.key)}
            style={{
              ...styles.modeButton,
              background: mode === m.key ? 'rgba(100, 108, 255, 0.8)' : 'rgba(255,255,255,0.08)',
            }}
            title={`${m.label} (${m.shortcut})`}
          >
            <span style={styles.modeShortcut}>{m.shortcut}</span> {m.label}
          </button>
        ))}
      </div>

      <div style={styles.form}>
        <div style={styles.inputRow}>
          <label style={styles.label}>W</label>
          <input
            type="number"
            value={width}
            min="0.1"
            step="0.1"
            onChange={e => setWidth(e.target.value)}
            style={styles.input}
          />
          <label style={styles.label}>H</label>
          <input
            type="number"
            value={height}
            min="0.1"
            step="0.1"
            onChange={e => setHeight(e.target.value)}
            style={styles.input}
          />
          <label style={styles.label}>D</label>
          <input
            type="number"
            value={depth}
            min="0.1"
            step="0.1"
            onChange={e => setDepth(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.colorRow}>
          {COLORS.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                ...styles.colorSwatch,
                backgroundColor: c,
                outline: color === c ? '2px solid white' : 'none',
              }}
            />
          ))}
        </div>
        <button onClick={handleAdd} style={styles.addButton}>
          + Add Cuboid
        </button>
      </div>

      <div style={styles.list}>
        {cuboids.length === 0 && (
          <p style={styles.empty}>No cuboids yet. Add one above!</p>
        )}
        {cuboids.map((c, i) => (
          <div
            key={c.id}
            onClick={() => onSelect(selectedId === c.id ? null : c.id)}
            style={{
              ...styles.listItem,
              background: selectedId === c.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ ...styles.colorDot, backgroundColor: c.color }} />
            <span style={styles.itemLabel}>#{i + 1}</span>
            <span style={styles.itemDims}>
              {c.width}×{c.height}×{c.depth}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onDelete(c.id); }}
              style={styles.deleteButton}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {selectedId && (
        <p style={styles.hint}>Click canvas to deselect</p>
      )}
    </div>
  );
}

export const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 260,
    background: 'rgba(20, 20, 30, 0.88)',
    backdropFilter: 'blur(8px)',
    borderRadius: 12,
    padding: '16px',
    color: '#fff',
    fontFamily: 'sans-serif',
    zIndex: 10,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  title: {
    margin: '0 0 12px',
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: '#ccc',
  },
  modeRow: {
    display: 'flex',
    gap: 4,
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    padding: '5px 4px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: '#fff',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: 0.2,
  },
  modeShortcut: {
    opacity: 0.6,
    fontWeight: 700,
  },
  form: {
    marginBottom: 12,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#aaa',
    width: 14,
  },
  input: {
    width: 44,
    padding: '4px 6px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
  },
  colorRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 4,
    cursor: 'pointer',
  },
  addButton: {
    width: '100%',
    padding: '8px',
    background: 'rgba(100, 108, 255, 0.7)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 240,
    overflowY: 'auto',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: 12,
    color: '#aaa',
    width: 24,
  },
  itemDims: {
    fontSize: 12,
    flex: 1,
    color: '#ddd',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: 12,
    padding: '2px 4px',
    borderRadius: 4,
  },
  empty: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    margin: '8px 0',
  },
  hint: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    margin: '8px 0 0',
  },
};
