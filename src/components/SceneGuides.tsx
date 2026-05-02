import type { Object3D } from 'three';

interface SceneGuidesProps {
  showAxes: boolean;
  showOrigin: boolean;
}

const disableRaycast = (object: Object3D | null) => {
  if (object) {
    object.raycast = () => null;
  }
};

export function SceneGuides({ showAxes, showOrigin }: SceneGuidesProps) {
  return (
    <group>
      {showAxes && (
        <axesHelper
          ref={disableRaycast}
          args={[4]}
        />
      )}
      {showOrigin && (
        <mesh
          ref={disableRaycast}
          position={[0, 0, 0]}
          renderOrder={1}
        >
          <sphereGeometry args={[0.08, 24, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#f7dc6f"
            emissiveIntensity={0.5}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
}
