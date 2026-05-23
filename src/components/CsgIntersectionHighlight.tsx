import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Brush, Evaluator, INTERSECTION } from 'three-bvh-csg';
import { Box3, BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial } from 'three';
import type { CuboidData } from '../types/Cuboid';
import { wireframeMaterial } from './CsgIntersectionMaterials';

interface CsgIntersectionHighlightProps {
  a: CuboidData;
  b: CuboidData;
}

const evaluator = new Evaluator();

const highlightMaterial = new MeshBasicMaterial({
  color: '#ff6b00',
  transparent: true,
  opacity: 0.68,
  depthTest: false,
  depthWrite: false,
  side: DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  toneMapped: false,
});

export function CsgIntersectionHighlight({ a, b }: CsgIntersectionHighlightProps) {
  const { scene } = useThree();

  const brushA = useRef(new Brush(new BoxGeometry(1, 1, 1)));
  const brushB = useRef(new Brush(new BoxGeometry(1, 1, 1)));
  const solidMesh = useRef<Brush | null>(null);
  const wireMesh = useRef<Mesh | null>(null);
  const aabbA = useRef(new Box3());
  const aabbB = useRef(new Box3());

  useEffect(() => {
    const ba = brushA.current;
    const bb = brushB.current;
    return () => {
      if (solidMesh.current) {
        scene.remove(solidMesh.current);
        solidMesh.current.geometry.dispose();
        solidMesh.current = null;
      }
      if (wireMesh.current) {
        scene.remove(wireMesh.current);
        // Geometry is shared with solidMesh and already disposed above.
        wireMesh.current = null;
      }
      ba.geometry.dispose();
      bb.geometry.dispose();
    };
  }, [scene]);

  useEffect(() => {
    brushA.current.position.set(...a.position);
    brushA.current.rotation.set(...a.rotation);
    brushA.current.scale.set(
      a.width  * a.scale[0],
      a.height * a.scale[1],
      a.depth  * a.scale[2],
    );
    brushA.current.updateMatrixWorld();

    brushB.current.position.set(...b.position);
    brushB.current.rotation.set(...b.rotation);
    brushB.current.scale.set(
      b.width  * b.scale[0],
      b.height * b.scale[1],
      b.depth  * b.scale[2],
    );
    brushB.current.updateMatrixWorld();

    if (solidMesh.current) {
      scene.remove(solidMesh.current);
      solidMesh.current.geometry.dispose();
      solidMesh.current = null;
    }
    if (wireMesh.current) {
      scene.remove(wireMesh.current);
      wireMesh.current = null;
    }

    // Cheap world-AABB overlap test before paying for the CSG intersection.
    aabbA.current.setFromObject(brushA.current);
    aabbB.current.setFromObject(brushB.current);
    if (!aabbA.current.intersectsBox(aabbB.current)) return;

    try {
      const result = evaluator.evaluate(brushA.current, brushB.current, INTERSECTION);
      const count = result.geometry.attributes.position?.count ?? 0;
      if (count === 0) {
        result.geometry.dispose();
        return;
      }

      result.material = highlightMaterial;
      result.renderOrder = 30;
      scene.add(result);
      solidMesh.current = result;

      // Reuse the same geometry for the pulsing wireframe pass — avoids a
      // second `evaluator.evaluate` call per pair, which is the dominant cost.
      const wire = new Mesh(result.geometry, wireframeMaterial);
      wire.matrixAutoUpdate = false;
      wire.matrix.copy(result.matrix);
      wire.renderOrder = 31;
      scene.add(wire);
      wireMesh.current = wire;
    } catch {
      // degenerate geometry — ignore
    }
  }, [a, b, scene]);

  return null;
}
