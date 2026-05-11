import { useState, useEffect, useCallback, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { CuboidData } from '../../../types/Cuboid';
import type { ViewMode } from '../../../types/Workspace';

interface ObjectTabProps {
  cuboids: CuboidData[];
  selectedId: string[] | null;
  onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  viewMode: ViewMode;
}

export function ObjectTab({ cuboids, selectedId, onAdd, onDelete, onSelect, onRename, viewMode }: ObjectTabProps) {
  const is2D = viewMode === '2d';

  // Add-form state
  const [name, setName] = useState('');
  const [width, setWidth] = useState('1');
  const [height, setHeight] = useState('1');
  const [depth, setDepth] = useState('1');
  const [color, setColor] = useState('#4ecdc4');
  const [hexInput, setHexInput] = useState('#4ecdc4');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Inline-rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (value: string) => {
    setColor(value);
    setHexInput(value);
  };

  const handleHexInput = (value: string) => {
    setHexInput(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setColor(value);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const handleAdd = useCallback(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const d = is2D ? 1 : parseFloat(depth);
    if (w > 0 && h > 0 && d > 0) {
      onAdd({ name: name.trim(), width: w, height: h, depth: d, color });
      setName('');
    }
  }, [width, height, depth, name, color, onAdd, is2D]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'a') handleAdd();
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleAdd]);

  const startEditing = useCallback((c: CuboidData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditingName(c.name);
  }, []);

  const commitRename = useCallback((id: string) => {
    const trimmed = editingName.trim();
    if (trimmed) onRename(id, trimmed);
    setEditingId(null);
  }, [editingName, onRename]);

  const selected = cuboids.find(c => selectedId?.includes(c.id)) ?? null;

  return (
    <div className="tab-content">
      <h4 className="tab-section-title">Add Cuboid</h4>
      <div className="object-form">
        {/* Name row */}
        <div className="object-name-row">
          <label className="object-label object-label--wide">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Default: Object #"
            className="object-input object-name-input"
          />
        </div>

        {/* Dimension row */}
        <div className="object-input-row">
          <label className="object-label">W</label>
          <input type="number" value={width} min="0.1" step="0.1" onChange={e => setWidth(e.target.value)} className="object-input" />
          <label className="object-label">H</label>
          <input type="number" value={height} min="0.1" step="0.1" onChange={e => setHeight(e.target.value)} className="object-input" />
          {!is2D && (
            <>
              <label className="object-label">D</label>
              <input type="number" value={depth} min="0.1" step="0.1" onChange={e => setDepth(e.target.value)} className="object-input" />
            </>
          )}
        </div>

        {/* Color picker row */}
        <div className="object-color-picker-row" ref={pickerRef}>
          <div
            className="object-color-swatch-button"
            style={{ backgroundColor: color }}
            onClick={() => setShowPicker(p => !p)}
            title="Pick a colour"
          />
          <input
            type="text"
            value={hexInput}
            onChange={e => handleHexInput(e.target.value)}
            placeholder="#4ecdc4"
            maxLength={7}
            className="object-input object-hex-input"
            spellCheck={false}
          />
          {showPicker && (
            <div className="object-color-popout">
              <HexColorPicker color={color} onChange={handleColorChange} />
              <div className="object-color-presets">
                {['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'].map(c => (
                  <div
                    key={c}
                    className={`object-preset-swatch ${color === c ? 'object-preset-swatch--active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => handleColorChange(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleAdd} className="object-add-button">
          + Add Cuboid <kbd style={{ marginLeft: '6px', opacity: 0.7, fontSize: '0.75em' }}>A</kbd>
        </button>
      </div>

      {/* Selected object properties */}
      {selected && (
        <>
          <h4 className="tab-section-title">Selected: {selected.name}</h4>
          <div className="object-props">
            <div className="object-prop-row">
              <span className="object-prop-label">Size</span>
              <span className="object-prop-value">
                {is2D
                  ? `${(selected.width * selected.scale[0]).toFixed(2)} × ${(selected.height * selected.scale[1]).toFixed(2)}`
                  : `${(selected.width * selected.scale[0]).toFixed(2)} × ${(selected.height * selected.scale[1]).toFixed(2)} × ${(selected.depth * selected.scale[2]).toFixed(2)}`}
              </span>
            </div>
            <div className="object-prop-row">
              <span className="object-prop-label">Position</span>
              <span className="object-prop-value">
                {is2D
                  ? `${selected.position[0].toFixed(2)}, ${selected.position[1].toFixed(2)}`
                  : selected.position.map(v => v.toFixed(2)).join(', ')}
              </span>
            </div>
            <div className="object-prop-row">
              <span className="object-prop-label">Rotation</span>
              <span className="object-prop-value">
                {is2D
                  ? `${(selected.rotation[2] * 180 / Math.PI).toFixed(1)}° (Z)`
                  : selected.rotation.map(v => (v * 180 / Math.PI).toFixed(1) + '°').join(', ')}
              </span>
            </div>
            <div className="object-prop-row">
              <span className="object-prop-label">Scale</span>
              <span className="object-prop-value">
                {is2D
                  ? `${selected.scale[0].toFixed(2)}, ${selected.scale[1].toFixed(2)}`
                  : selected.scale.map(v => v.toFixed(2)).join(', ')}
              </span>
            </div>
            <div className="object-prop-row">
              <span className="object-prop-label">Color</span>
              <span className="object-prop-value">
                <span className="object-color-dot" style={{ backgroundColor: selected.color }} />
                {selected.color}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Cuboid list */}
      <h4 className="tab-section-title">Objects ({cuboids.length})</h4>
      <div className="object-list">
        {cuboids.length === 0 && <p className="tab-hint">No cuboids yet. Add one above.</p>}
        {cuboids.map(c => (
          <div
            key={c.id}
            className={`object-list-item ${selectedId?.includes(c.id) ? 'object-list-item--selected' : ''}`}
            onClick={() => { if (editingId !== c.id) onSelect(c.id); }}
          >
            <span className="object-color-dot" style={{ backgroundColor: c.color }} />
            {editingId === c.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onBlur={() => commitRename(c.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); commitRename(c.id); }
                  if (e.key === 'Escape') { e.stopPropagation(); setEditingId(null); }
                }}
                onClick={e => e.stopPropagation()}
                autoFocus
                className="object-list-name-input"
              />
            ) : (
              <span
                className="object-list-name"
                onDoubleClick={e => startEditing(c, e)}
                title="Double-click to rename"
              >
                {c.name}
              </span>
            )}
            <button className="object-delete-button" onClick={e => { e.stopPropagation(); onDelete(c.id); }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
