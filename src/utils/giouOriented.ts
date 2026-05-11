// ============================================================
// Rotation-aware (oriented bounding box) GIoU for cuboids.
//
// 3D: clip every edge of each OBB against the other OBB's
// half-spaces, take the convex hull of the resulting points,
// and compute its volume. Enclosing region is the convex hull
// of all 16 corners. Union via inclusion-exclusion.
//
// 2D: project both OBBs to the XY (front-facing) plane via their
// 8 world-space corners, take the 2D convex hull of each
// projection, then use Sutherland-Hodgman polygon clipping.
//
// Drop-in alternative to the AABB versions in `./giou.ts`.
// ============================================================

import type { CuboidData } from "../types/Cuboid";
import type { IoUResult } from "./giou";

type Vec2 = [number, number];
type Vec3 = [number, number, number];

const EPS = 1e-9;

// ---- Vector helpers -----------------------------------------

const v3 = {
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ],
};

// ---- Euler XYZ → 3x3 matrix (Three.js default order) --------

function eulerXYZ(rx: number, ry: number, rz: number): number[][] {
  const c1 = Math.cos(rx), s1 = Math.sin(rx);
  const c2 = Math.cos(ry), s2 = Math.sin(ry);
  const c3 = Math.cos(rz), s3 = Math.sin(rz);
  return [
    [c2 * c3,                -c2 * s3,                s2],
    [c1 * s3 + s1 * s2 * c3,  c1 * c3 - s1 * s2 * s3, -s1 * c2],
    [s1 * s3 - c1 * s2 * c3,  s1 * c3 + c1 * s2 * s3,  c1 * c2],
  ];
}

// ---- OBB construction ---------------------------------------

interface Plane { n: Vec3; p: Vec3; }

interface OBB {
  corners: Vec3[];          // 8 world-space corners
  planes: Plane[];          // 6 outward face half-spaces
  volume: number;
}

function buildOBB(c: CuboidData): OBB {
  const halfExt: Vec3 = [
    c.width  * 0.5 * c.scale[0],
    c.height * 0.5 * c.scale[1],
    c.depth  * 0.5 * c.scale[2],
  ];
  const R = eulerXYZ(c.rotation[0], c.rotation[1], c.rotation[2]);
  // Local axes in world space = columns of R
  const axes: Vec3[] = [
    [R[0][0], R[1][0], R[2][0]],
    [R[0][1], R[1][1], R[2][1]],
    [R[0][2], R[1][2], R[2][2]],
  ];
  const center: Vec3 = [c.position[0], c.position[1], c.position[2]];

  const corners: Vec3[] = [];
  for (let sx = -1; sx <= 1; sx += 2)
    for (let sy = -1; sy <= 1; sy += 2)
      for (let sz = -1; sz <= 1; sz += 2) {
        const offset = v3.add(
          v3.add(
            v3.scale(axes[0], sx * halfExt[0]),
            v3.scale(axes[1], sy * halfExt[1]),
          ),
          v3.scale(axes[2], sz * halfExt[2]),
        );
        corners.push(v3.add(center, offset));
      }

  const planes: Plane[] = [];
  for (let i = 0; i < 3; i++) {
    for (const s of [-1, 1]) {
      const n = v3.scale(axes[i], s);
      const p = v3.add(center, v3.scale(n, halfExt[i]));
      planes.push({ n, p });
    }
  }

  const volume = 8 * halfExt[0] * halfExt[1] * halfExt[2];
  return { corners, planes, volume };
}

// ---- Cuboid edges (12 edges as corner-index pairs) ----------

const CUBOID_EDGES: [number, number][] = (() => {
  const e: [number, number][] = [];
  for (let i = 0; i < 8; i++)
    for (let j = i + 1; j < 8; j++) {
      const d = i ^ j;
      const bits = (d & 1) + ((d >> 1) & 1) + ((d >> 2) & 1);
      if (bits === 1) e.push([i, j]);
    }
  return e;
})();

// ---- Liang-Barsky 3D: clip a segment against a half-space set

function clipSegmentToHalfSpaces(
  a: Vec3,
  b: Vec3,
  planes: Plane[],
): [Vec3, Vec3] | null {
  let tMin = 0, tMax = 1;
  const d = v3.sub(b, a);
  for (const pl of planes) {
    // Inside iff dot(n, x - p) <= 0  =>  num + t * denom <= 0
    const num = v3.dot(pl.n, v3.sub(a, pl.p));
    const denom = v3.dot(pl.n, d);
    if (Math.abs(denom) < EPS) {
      if (num > EPS) return null;       // segment parallel and outside
    } else if (denom > 0) {
      tMax = Math.min(tMax, -num / denom);
    } else {
      tMin = Math.max(tMin, -num / denom);
    }
    if (tMin > tMax + EPS) return null;
  }
  return [v3.add(a, v3.scale(d, tMin)), v3.add(a, v3.scale(d, tMax))];
}

// ---- 3D incremental convex hull -----------------------------

interface Face { a: number; b: number; c: number; n: Vec3; offset: number; }

function makeFace(a: number, b: number, c: number, pts: Vec3[]): Face {
  const ab = v3.sub(pts[b], pts[a]);
  const ac = v3.sub(pts[c], pts[a]);
  const n = v3.cross(ab, ac);
  return { a, b, c, n, offset: v3.dot(n, pts[a]) };
}

function flipFace(f: Face): Face {
  return { a: f.a, b: f.c, c: f.b, n: v3.scale(f.n, -1), offset: -f.offset };
}

function orientOutward(f: Face, interior: Vec3, pts: Vec3[]): Face {
  // If the normal points toward the known-interior reference, flip it.
  if (v3.dot(f.n, v3.sub(interior, pts[f.a])) > 0) return flipFace(f);
  return f;
}

function convexHull3D(pts: Vec3[]): Face[] | null {
  const n = pts.length;
  if (n < 4) return null;

  // Seed point i0; pick i1 farthest from i0
  let i0 = 0, i1 = -1, best = 0;
  for (let i = 1; i < n; i++) {
    const d = v3.sub(pts[i], pts[i0]);
    const m = v3.dot(d, d);
    if (m > best) { best = m; i1 = i; }
  }
  if (i1 < 0 || best < EPS) return null;

  // i2 farthest from line (i0, i1)
  const d01 = v3.sub(pts[i1], pts[i0]);
  const len01sq = v3.dot(d01, d01);
  let i2 = -1; best = 0;
  for (let i = 0; i < n; i++) {
    if (i === i0 || i === i1) continue;
    const c = v3.cross(d01, v3.sub(pts[i], pts[i0]));
    const distSq = v3.dot(c, c) / len01sq;
    if (distSq > best) { best = distSq; i2 = i; }
  }
  if (i2 < 0 || best < EPS) return null;

  // i3 farthest from plane (i0, i1, i2)
  const planeN = v3.cross(d01, v3.sub(pts[i2], pts[i0]));
  let i3 = -1; best = 0;
  for (let i = 0; i < n; i++) {
    if (i === i0 || i === i1 || i === i2) continue;
    const dist = Math.abs(v3.dot(planeN, v3.sub(pts[i], pts[i0])));
    if (dist > best) { best = dist; i3 = i; }
  }
  if (i3 < 0 || best < EPS) return null;

  const interior: Vec3 = [
    (pts[i0][0] + pts[i1][0] + pts[i2][0] + pts[i3][0]) / 4,
    (pts[i0][1] + pts[i1][1] + pts[i2][1] + pts[i3][1]) / 4,
    (pts[i0][2] + pts[i1][2] + pts[i2][2] + pts[i3][2]) / 4,
  ];

  let faces: Face[] = [
    orientOutward(makeFace(i0, i1, i2, pts), interior, pts),
    orientOutward(makeFace(i0, i1, i3, pts), interior, pts),
    orientOutward(makeFace(i0, i2, i3, pts), interior, pts),
    orientOutward(makeFace(i1, i2, i3, pts), interior, pts),
  ];

  const used = new Set([i0, i1, i2, i3]);
  for (let p = 0; p < n; p++) {
    if (used.has(p)) continue;

    // Visible faces: point lies in front of the face plane
    const visible = new Set<number>();
    for (let fi = 0; fi < faces.length; fi++) {
      const f = faces[fi];
      const nLen = Math.hypot(f.n[0], f.n[1], f.n[2]);
      if (nLen < EPS) continue;
      if ((v3.dot(f.n, pts[p]) - f.offset) / nLen > EPS) visible.add(fi);
    }
    if (visible.size === 0) continue; // point is inside current hull

    // Horizon edges: edges of visible faces not shared with another visible face
    const edgeMap = new Map<string, { count: number; e: [number, number] }>();
    for (const fi of visible) {
      const f = faces[fi];
      const es: [number, number][] = [[f.a, f.b], [f.b, f.c], [f.c, f.a]];
      for (const e of es) {
        const k = e[0] < e[1] ? `${e[0]}|${e[1]}` : `${e[1]}|${e[0]}`;
        const existing = edgeMap.get(k);
        if (existing) existing.count++;
        else edgeMap.set(k, { count: 1, e });
      }
    }

    faces = faces.filter((_, idx) => !visible.has(idx));
    for (const { count, e } of edgeMap.values()) {
      if (count === 1) {
        faces.push(orientOutward(makeFace(e[0], e[1], p, pts), interior, pts));
      }
    }
    used.add(p);
  }
  return faces;
}

function polyhedronVolume(faces: Face[], pts: Vec3[]): number {
  // Sum signed tet volumes from origin: V = (1/6) Σ a · (b × c)
  // Outward-oriented faces give a consistent sign; abs handles the rest.
  let v = 0;
  for (const f of faces) {
    v += v3.dot(pts[f.a], v3.cross(pts[f.b], pts[f.c])) / 6;
  }
  return Math.abs(v);
}

// ---- Public 3D API ------------------------------------------

export function giou3DOriented(a: CuboidData, b: CuboidData): IoUResult {
  const A = buildOBB(a);
  const B = buildOBB(b);

  // Intersection: every edge of A clipped to B (and vice versa).
  // The clipped endpoints are exactly the vertices of A ∩ B
  // (corners of A inside B fall out as t=0/t=1 endpoints).
  const interPts: Vec3[] = [];
  for (const [i, j] of CUBOID_EDGES) {
    const seg = clipSegmentToHalfSpaces(A.corners[i], A.corners[j], B.planes);
    if (seg) interPts.push(seg[0], seg[1]);
  }
  for (const [i, j] of CUBOID_EDGES) {
    const seg = clipSegmentToHalfSpaces(B.corners[i], B.corners[j], A.planes);
    if (seg) interPts.push(seg[0], seg[1]);
  }

  let interVol = 0;
  if (interPts.length >= 4) {
    const faces = convexHull3D(interPts);
    if (faces) interVol = polyhedronVolume(faces, interPts);
  }

  // Enclosing region: convex hull of all 16 corners
  const allCorners = [...A.corners, ...B.corners];
  let encVol = 0;
  const encFaces = convexHull3D(allCorners);
  if (encFaces) encVol = polyhedronVolume(encFaces, allCorners);

  const union = A.volume + B.volume - interVol;
  const iou = union > EPS ? interVol / union : 0;
  const giou = encVol > EPS ? iou - (encVol - union) / encVol : iou;

  return { iou, giou, lossIoU: 1 - iou, lossGIoU: 1 - giou };
}

// ---- 2D front-facing (XY projection) ------------------------

function projectXY(corners: Vec3[]): Vec2[] {
  return corners.map(c => [c[0], c[1]] as Vec2);
}

function convexHull2D(points: Vec2[]): Vec2[] {
  if (points.length < 2) return points.slice();
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Vec2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper); // CCW
}

function polygonArea(poly: Vec2[]): number {
  if (poly.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}

function lineLineIntersect(A: Vec2, B: Vec2, P: Vec2, Q: Vec2): Vec2 {
  const dx1 = B[0] - A[0], dy1 = B[1] - A[1];
  const dx2 = Q[0] - P[0], dy2 = Q[1] - P[1];
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < EPS) return P;
  const t = (dy1 * (P[0] - A[0]) - dx1 * (P[1] - A[1])) / denom;
  return [P[0] + t * dx2, P[1] + t * dy2];
}

function polygonClip(subject: Vec2[], clip: Vec2[]): Vec2[] {
  // Sutherland-Hodgman; clip polygon must be convex and CCW.
  let output = subject.slice();
  for (let i = 0; i < clip.length; i++) {
    if (output.length === 0) break;
    const A = clip[i], B = clip[(i + 1) % clip.length];
    const input = output;
    output = [];
    const inside = (p: Vec2) =>
      (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]) >= -EPS;
    for (let j = 0; j < input.length; j++) {
      const cur = input[j];
      const prev = input[(j - 1 + input.length) % input.length];
      const curIn = inside(cur);
      const prevIn = inside(prev);
      if (curIn) {
        if (!prevIn) output.push(lineLineIntersect(A, B, prev, cur));
        output.push(cur);
      } else if (prevIn) {
        output.push(lineLineIntersect(A, B, prev, cur));
      }
    }
  }
  return output;
}

// ---- Public 2D API ------------------------------------------

export function giou2DOriented(a: CuboidData, b: CuboidData): IoUResult {
  const A = buildOBB(a);
  const B = buildOBB(b);

  // Project the 8 world corners of each OBB to XY. Z is the removed axis.
  // In 2D mode cuboids have rz-only rotation so each projection is a rectangle.
  const polyA = convexHull2D(projectXY(A.corners));
  const polyB = convexHull2D(projectXY(B.corners));

  const areaA = polygonArea(polyA);
  const areaB = polygonArea(polyB);
  const interArea = polygonArea(polygonClip(polyA, polyB));
  const enclosing = convexHull2D([...projectXY(A.corners), ...projectXY(B.corners)]);
  const encArea = polygonArea(enclosing);

  const union = areaA + areaB - interArea;
  const iou = union > EPS ? interArea / union : 0;
  const giou = encArea > EPS ? iou - (encArea - union) / encArea : iou;

  return { iou, giou, lossIoU: 1 - iou, lossGIoU: 1 - giou };
}
