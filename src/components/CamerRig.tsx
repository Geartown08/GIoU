import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera } from 'three';
import type { ViewMode } from '../types/Workspace';

type CameraRigProps = {
  viewMode: ViewMode;
};

/**
 * Manages perspective ↔ orthographic camera switching.
 * In 2D mode: front-facing orthographic camera looking down the Z-axis (XY plane).
 * In 3D mode: restores the original perspective camera.
 */
export function CameraRig({ viewMode }: CameraRigProps) {
  const { camera, set, size } = useThree();

  const savedPerspCam = useRef(camera);
  const orthoCam = useRef<OrthographicCamera | null>(null);

  useEffect(() => {
    if (viewMode === '2d') {
      savedPerspCam.current = camera;

      const aspect = size.width / size.height;
      const d = 10;

      const ortho = new OrthographicCamera(
        -d * aspect,
        d * aspect,
        d,
        -d,
        0.1,
        1000
      );

      ortho.position.set(0, 0, 20);
      ortho.lookAt(0, 0, 0);

      orthoCam.current = ortho;

      set({ camera: ortho });
    } else {
      if (orthoCam.current) {
        set({ camera: savedPerspCam.current });
        orthoCam.current = null;
      }
    }
  }, [viewMode, camera, set, size]);

  // Keep ortho frustum correct on resize
  useEffect(() => {
    if (viewMode === '2d' && orthoCam.current) {
      const aspect = size.width / size.height;
      const d = 10;

      orthoCam.current.left = -d * aspect;
      orthoCam.current.right = d * aspect;

      orthoCam.current.updateProjectionMatrix();
    }
  }, [size, viewMode]);

  return null;
}