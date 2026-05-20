import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Brush, Evaluator, INTERSECTION } from 'three-bvh-csg';
import { BoxGeometry, MeshBasicMaterial, Clock } from 'three';
import type { CuboidData } from '../types/Cuboid';

interface CsgIntersectionHighlightProps {
  a: CuboidData;
  b: CuboidData;
}

const evaluator = new Evaluator();
const clock = new Clock();

const highlightMaterial = new MeshBasicMaterial({
  color: '#ff3300',
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -1,
});

const wireframeMaterial = new MeshBasicMaterial({
  color: '#ffffff',
  wireframe: true,
  transparent: true,
  opacity: 1.0,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});

export function CsgIntersectionHighlight({ a, b }: CsgIntersectionHighlightProps) {
  const { scene } = useThree();

  const aRef = useRef(a);
  const bRef = useRef(b);
  useEffect(() => { aRef.current = a; }, [a]);
  useEffect(() => { bRef.current = b; }, [b]);

  const brushA = useRef(new Brush(new BoxGeometry(1, 1, 1)));
  const brushB = useRef(new Brush(new BoxGeometry(1, 1, 1)));

  const solidMesh = useRef<Brush | null>(null);
  const wireMesh = useRef<Brush | null>(null);

  useEffect(() => {
    const brushACurrent = brushA.current;
    const brushBCurrent = brushB.current;

    return () => {
      if (solidMesh.current) {
        scene.remove(solidMesh.current);
        solidMesh.current.geometry.dispose();
        solidMesh.current = null;
      }
      if (wireMesh.current) {
        scene.remove(wireMesh.current);
        wireMesh.current.geometry.dispose();
        wireMesh.current = null;
      }
      brushACurrent.geometry.dispose();
      brushBCurrent.geometry.dispose();
    };
  }, [scene]);

  useFrame(() => {
    const a = aRef.current;
    const b = bRef.current;

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

    // Pulse wireframe opacity between 0.4 and 1.0
    const pulse = (Math.sin(clock.getElapsedTime() * 4) + 1) / 2;
    wireframeMaterial.opacity = 0.4 + pulse * 0.6;

    try {
      // Remove old meshes
      if (solidMesh.current) {
        scene.remove(solidMesh.current);
        solidMesh.current.geometry.dispose();
        solidMesh.current = null;
      }
      if (wireMesh.current) {
        scene.remove(wireMesh.current);
        wireMesh.current.geometry.dispose();
        wireMesh.current = null;
      }

      const result = evaluator.evaluate(brushA.current, brushB.current, INTERSECTION);
      const count = result.geometry.attributes.position?.count ?? 0;

      if (count > 0) {
        // Solid layer — exactly as the working version, just different material
        result.material = highlightMaterial;
        scene.add(result);
        solidMesh.current = result;

        // Wireframe — clone the result brush itself, not just geometry
        const wire = evaluator.evaluate(brushA.current, brushB.current, INTERSECTION);
        wire.material = wireframeMaterial;
        scene.add(wire);
        wireMesh.current = wire;
      }
    } catch {
      // degenerate geometry — ignore
    }
  });

  return null;
}
