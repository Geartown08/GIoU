import { Billboard, Text } from '@react-three/drei';
import type { Object3D } from 'three';
import type { Theme } from '../hooks/useTheme';

interface SceneGuidesProps {
  showAxes: boolean;
  showOrigin: boolean;
  theme: Theme;
}

const disableRaycast = (object: Object3D | null) => {
  if (object) {
    object.raycast = () => null;
  }
};

const AXIS_LENGTH = 3.85;
const AXIS_SHAFT_LENGTH = 3.55;
const AXIS_LABEL_OFFSET = 0.28;

const GUIDE_THEME = {
  night: {
    x: '#ff5f6d',
    y: '#67f07d',
    z: '#6f8cff',
    labelOutline: '#080a14',
    origin: '#fff8d6',
    originGlow: '#f7dc6f',
    opacity: 0.88,
  },
  day: {
    x: '#c92a2a',
    y: '#087f3d',
    z: '#224bd8',
    labelOutline: '#f8fbff',
    origin: '#172033',
    originGlow: '#f59e0b',
    opacity: 0.95,
  },
} as const;

const AXES = [
  {
    key: 'x',
    label: 'X',
    shaftPosition: [AXIS_SHAFT_LENGTH / 2, 0, 0] as [number, number, number],
    tipPosition: [AXIS_LENGTH, 0, 0] as [number, number, number],
    labelPosition: [AXIS_LENGTH + AXIS_LABEL_OFFSET, 0, 0] as [number, number, number],
    rotation: [0, 0, -Math.PI / 2] as [number, number, number],
  },
  {
    key: 'y',
    label: 'Y',
    shaftPosition: [0, AXIS_SHAFT_LENGTH / 2, 0] as [number, number, number],
    tipPosition: [0, AXIS_LENGTH, 0] as [number, number, number],
    labelPosition: [0, AXIS_LENGTH + AXIS_LABEL_OFFSET, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  {
    key: 'z',
    label: 'Z',
    shaftPosition: [0, 0, AXIS_SHAFT_LENGTH / 2] as [number, number, number],
    tipPosition: [0, 0, AXIS_LENGTH] as [number, number, number],
    labelPosition: [0, 0, AXIS_LENGTH + AXIS_LABEL_OFFSET] as [number, number, number],
    rotation: [Math.PI / 2, 0, 0] as [number, number, number],
  },
] as const;

function AxisGuide({
  axis,
  color,
  labelOutline,
  opacity,
}: {
  axis: typeof AXES[number];
  color: string;
  labelOutline: string;
  opacity: number;
}) {
  return (
    <group>
      <mesh
        ref={disableRaycast}
        position={axis.shaftPosition}
        rotation={axis.rotation}
        renderOrder={12}
      >
        <cylinderGeometry args={[0.025, 0.025, AXIS_SHAFT_LENGTH, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={disableRaycast}
        position={axis.tipPosition}
        rotation={axis.rotation}
        renderOrder={13}
      >
        <coneGeometry args={[0.1, 0.32, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={1}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <Billboard
        ref={disableRaycast}
        position={axis.labelPosition}
        renderOrder={14}
      >
        <Text
          fontSize={0.26}
          fontWeight={700}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.035}
          outlineColor={labelOutline}
        >
          {axis.label}
        </Text>
      </Billboard>
    </group>
  );
}

export function SceneGuides({ showAxes, showOrigin, theme }: SceneGuidesProps) {
  const colors = GUIDE_THEME[theme];

  return (
    <group>
      {showAxes && (
        <>
          {AXES.map(axis => (
            <AxisGuide
              key={axis.key}
              axis={axis}
              color={colors[axis.key]}
              labelOutline={colors.labelOutline}
              opacity={colors.opacity}
            />
          ))}
        </>
      )}
      {showOrigin && (
        <mesh
          ref={disableRaycast}
          position={[0, 0, 0]}
          renderOrder={15}
        >
          <sphereGeometry args={[0.1, 24, 16]} />
          <meshBasicMaterial
            color={colors.origin}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
          <pointLight
            color={colors.originGlow}
            intensity={0.3}
            distance={1.4}
          />
        </mesh>
      )}
    </group>
  );
}
