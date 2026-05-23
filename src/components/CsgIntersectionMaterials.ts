import { DoubleSide, MeshBasicMaterial } from 'three';

export const wireframeMaterial = new MeshBasicMaterial({
  color: '#fff4b8',
  wireframe: true,
  transparent: true,
  opacity: 1.0,
  depthTest: false,
  depthWrite: false,
  side: DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  toneMapped: false,
});
