import { useState, useEffect, useCallback, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
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
  onAddShortcutChange: (handler: (() => void) | null) => void;
  onStatus: (message: string) => void;
}

export function ObjectTab({
  cuboids,
  selectedId,
  onAdd,
  onDelete,
  onSelect,
  onRename,
  viewMode,
  onAddShortcutChange,
  onStatus,
}: ObjectTabProps) {
  const is2D = viewMode === '2d';

  const [name, setName] = useState('');
  const [width, setWidth] = useState('1');
  const [height, setHeight] = useState('1');
  const [depth, setDepth] = useState('1');
  const [color, setColor] = useState('#4ecdc4');
  const [hexInput, setHexInput] = useState('#4ecdc4');
  const [showPicker, setShowPicker] = useState(false);
  const [formError, setFormError] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const isHexValid = /^#[0-9a-fA-F]{6}$/.test(hexInput);
  const handleAddRef = useRef<(() => void) | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (value: string) => {
    setColor(value);
    setHexInput(value);
    setFormError('');
  };

  const handleHexInput = (value: string) => {
    setHexInput(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setColor(value);
      setFormError('');
    }
  };

  const clearDimensionError = () => {
    if (formError === 'Width, height and depth must be greater than 0.') {
      setFormError('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
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
    if (!(w > 0 && h > 0 && d > 0)) {
      const message = 'Width, height and depth must be greater than 0.';
      setFormError(message);
      onStatus('Add failed: invalid size');
      return;
    }
    if (!isHexValid) {
      const message = 'Enter a valid hex colour, for example #4ecdc4.';
      setFormError(message);
      onStatus('Add failed: invalid colour');
      return;
    }
    onAdd({ name: name.trim(), width: w, height: h, depth: d, color });
    setName('');
    setFormError('');
  }, [width, height, depth, name, color, is2D, isHexValid, onAdd, onStatus]);

  useEffect(() => {
    handleAddRef.current = handleAdd;
  }, [handleAdd]);

  useEffect(() => {
    const addFromShortcut = () => handleAddRef.current?.();
    onAddShortcutChange(addFromShortcut);
    return () => onAddShortcutChange(null);
  }, [onAddShortcutChange]);

  const startEditing = useCallback((c: CuboidData, e: ReactMouseEvent) => {
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

        <div className="object-input-row">
          <label className="object-label">W</label>
          <input type="number" value={width} min="0.1" step="0.1" onChange={e => { clearDimensionError(); setWidth(e.target.value); }} className="object-input" />
          <label className="object-label">H</label>
          <input type="number" value={height} min="0.1" step="0.1" onChange={e => { clearDimensionError(); setHeight(e.target.value); }} className="object-input" />
          {!is2D && (
            <>
              <label className="object-label">D</label>
              <input type="number" value={depth} min="0.1" step="0.1" onChange={e => { clearDimensionError(); setDepth(e.target.value); }} className="object-input" />
            </>
          )}
        </div>

        <div className="object-color-picker-row" ref={pickerRef}>
          <div
            role="button"
            tabIndex={0}
            className="object-color-swatch-button"
            style={{ backgroundColor: color }}
            onClick={() => setShowPicker(p => !p)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowPicker(p => !p);
              }
              if (e.key === 'Escape') {
                setShowPicker(false);
              }
            }}
            title="Pick a colour"
          />
          <input
            type="text"
            value={hexInput}
            onChange={e => handleHexInput(e.target.value)}
            placeholder="#4ecdc4"
            maxLength={7}
            className={`object-input object-hex-input ${isHexValid ? '' : 'object-input--invalid'}`}
            aria-invalid={!isHexValid}
            spellCheck={false}
          />
          {showPicker && (
            <div className="object-color-popout">
              <HexColorPicker color={color} onChange={handleColorChange} />
              <div className="object-color-presets">
                {['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'].map(c => (
                  <div
                    key={c}
                    role="button"
                    tabIndex={0}
                    className={`object-preset-swatch ${color === c ? 'object-preset-swatch--active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => handleColorChange(c)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleColorChange(c);
                      }
                      if (e.key === 'Escape') {
                        setShowPicker(false);
                      }
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleAdd} className="object-add-button">
          + Add Cuboid <kbd aria-hidden="true" style={{ marginLeft: '6px', opacity: 0.7, fontSize: '0.75em' }}>A</kbd>
        </button>
        {formError && <p className="object-form-error" role="alert">{formError}</p>}
      </div>

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

      <h4 className="tab-section-title">Objects ({cuboids.length})</h4>
      <div className="object-list">
        {cuboids.length === 0 && <p className="tab-hint">No cuboids yet. Add one above.</p>}
        {cuboids.map((c, i) => {
          const isSelected = selectedId?.includes(c.id) ?? false;
          const dims = is2D
            ? `${(c.width * c.scale[0]).toFixed(2)}×${(c.height * c.scale[1]).toFixed(2)}`
            : `${(c.width * c.scale[0]).toFixed(2)}×${(c.height * c.scale[1]).toFixed(2)}×${(c.depth * c.scale[2]).toFixed(2)}`;

          return (
            <div
              key={c.id}
              className={`object-list-item ${isSelected ? 'object-list-item--selected' : ''}`}
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
                  autoFocus
                  className="object-list-name-input"
                />
              ) : (
                <button
                  type="button"
                  className="object-list-select-button"
                  aria-label={`Select cuboid #${i + 1}, ${c.name}, ${dims}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(c.id)}
                  onDoubleClick={e => startEditing(c, e)}
                  title="Double-click to rename"
                >
                  <span className="object-list-name">{c.name}</span>
                  <span className="object-list-dims">{dims}</span>
                </button>
              )}
              <button
                type="button"
                className="object-delete-button"
                aria-label={`Delete cuboid #${i + 1}`}
                onClick={() => onDelete(c.id)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
