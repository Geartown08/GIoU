import { useState } from 'react';
import type { CuboidData } from '../../../types/Cuboid';

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];

interface ObjectTabProps {
  cuboids: CuboidData[];
  selectedId: string | null;
  onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
}

export function ObjectTab({ cuboids, selectedId, onAdd, onDelete, onSelect }: ObjectTabProps) {
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

  const selected = cuboids.find(c => c.id === selectedId) ?? null;

  return (
    <div className="tab-content">
      {/* Creation form */}
      <h4 className="tab-section-title">Add Cuboid</h4>
      <div className="object-form">
        <div className="object-input-row">
          <label className="object-label">W</label>
          <input
            type="number"
            value={width}
            min="0.1"
            step="0.1"
            onChange={e => setWidth(e.target.value)}
            className="object-input"
          />
          <label className="object-label">H</label>
          <input
            type="number"
            value={height}
            min="0.1"
            step="0.1"
            onChange={e => setHeight(e.target.value)}
            className="object-input"
          />
          <label className="object-label">D</label>
          <input
            type="number"
            value={depth}
            min="0.1"
            step="0.1"
            onChange={e => setDepth(e.target.value)}
            className="object-input"
          />
        </div>
        <div className="object-color-row">
          {COLORS.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              className={`object-color-swatch ${color === c ? 'object-color-swatch--active' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button onClick={handleAdd} className="object-add-button">
          + Add Cuboid
        </button>
      </div>

      {/* Selected object properties */}
      {selected && (
        <>
          <h4 className="tab-section-title">Selected: #{cuboids.indexOf(selected) + 1}</h4>
          <div className="object-props">
            <div className="object-prop-row">
              <span className="object-prop-label">Size</span>
              <span className="object-prop-value">
                {(selected.width * selected.scale[0]).toFixed(2)} × {(selected.height * selected.scale[1]).toFixed(2)} × {(selected.depth * selected.scale[2]).toFixed(2)}
              </span>
            </div>
            <div className="object-prop-row">
              <span className="object-prop-label">Position</span>
              <span className="object-prop-value">
                {selected.position.map(v => v.toFixed(2)).join(', ')}
              </span>
            </div>
            <div className="object-prop-row">
              <span className="object-prop-label">Rotation</span>
              <span className="object-prop-value">
                {selected.rotation.map(v => (v * 180 / Math.PI).toFixed(1) + '°').join(', ')}
              </span>
            </div>
            <div className="object-prop-row">
              <span className="object-prop-label">Scale</span>
              <span className="object-prop-value">
                {selected.scale.map(v => v.toFixed(2)).join(', ')}
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
        {cuboids.length === 0 && (
          <p className="tab-hint">No cuboids yet. Add one above.</p>
        )}
        {cuboids.map((c, i) => (
          <div
            key={c.id}
            className={`object-list-item ${selectedId === c.id ? 'object-list-item--selected' : ''}`}
            onClick={() => onSelect(selectedId === c.id ? null : c.id)}
          >
            <span className="object-color-dot" style={{ backgroundColor: c.color }} />
            <span className="object-list-label">#{i + 1}</span>
            <span className="object-list-dims">
              {(c.width * c.scale[0]).toFixed(2)}×{(c.height * c.scale[1]).toFixed(2)}×{(c.depth * c.scale[2]).toFixed(2)}
            </span>
            <button
              className="object-delete-button"
              onClick={e => { e.stopPropagation(); onDelete(c.id); }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
