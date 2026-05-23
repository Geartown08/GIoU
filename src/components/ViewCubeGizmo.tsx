import { useState } from 'react';
import { Vector3 } from 'three';
import { useGizmoContext } from '@react-three/drei';
import type { Theme } from '../hooks/useTheme';

// Each arrow sits just outside a cube face (cube spans -30..+30 at scale=60,
// arrows at ±40 give a clean ~10px gap).
const ARROWS = [
  { id: 'right',  pos: [40, 0, 0]  as [number,number,number], dir: [1, 0, 0]  as [number,number,number], rot: [0, 0, -Math.PI / 2] as [number,number,number] },
  { id: 'left',   pos: [-40, 0, 0] as [number,number,number], dir: [-1, 0, 0] as [number,number,number], rot: [0, 0, Math.PI / 2]  as [number,number,number] },
  { id: 'top',    pos: [0, 40, 0]  as [number,number,number], dir: [0, 1, 0]  as [number,number,number], rot: [0, 0, 0]             as [number,number,number] },
  { id: 'bottom', pos: [0, -40, 0] as [number,number,number], dir: [0, -1, 0] as [number,number,number], rot: [Math.PI, 0, 0]       as [number,number,number] },
  { id: 'front',  pos: [0, 0, 40]  as [number,number,number], dir: [0, 0, 1]  as [number,number,number], rot: [Math.PI / 2, 0, 0]   as [number,number,number] },
  { id: 'back',   pos: [0, 0, -40] as [number,number,number], dir: [0, 0, -1] as [number,number,number], rot: [-Math.PI / 2, 0, 0]  as [number,number,number] },
] as const;

const ARROW_THEME: Record<Theme, { rest: string; hover: string }> = {
  night: { rest: '#9098ff', hover: '#ffffff' },
  day:   { rest: '#536df4', hover: '#2437a3' },
};

function DirectionArrow({
  pos, dir, rot, colors,
}: { pos: [number,number,number]; dir: [number,number,number]; rot: [number,number,number]; colors: { rest: string; hover: string } }) {
  const { tweenCamera } = useGizmoContext();
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={pos}
      rotation={rot}
      scale={hovered ? 1.35 : 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e)  => { e.stopPropagation(); setHovered(false); }}
      onClick={(e) => {
        e.stopPropagation();
        tweenCamera(new Vector3(...dir));
      }}
    >
      {/* Arrowhead cone */}
      <mesh position={[0, 3, 0]}>
        <coneGeometry args={[3.2, 7, 8]} />
        <meshBasicMaterial
          color={hovered ? colors.hover : colors.rest}
          transparent
          opacity={hovered ? 1 : 0.65}
          depthTest={false}
        />
      </mesh>
      {/* Stem cylinder */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 4, 8]} />
        <meshBasicMaterial
          color={hovered ? colors.hover : colors.rest}
          transparent
          opacity={hovered ? 0.9 : 0.45}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}

/** Drop inside <GizmoHelper> alongside <GizmoViewcube>. */
export function ViewCubeDirectionArrows({ theme }: { theme: Theme }) {
  const colors = ARROW_THEME[theme];
  return (
    <>
      {ARROWS.map(a => (
        <DirectionArrow key={a.id} {...a} colors={colors} />
      ))}
    </>
  );
}
