// ============================================================
// GIoU 2D and 3D Bounding Box Loss Calculations
// Based on: "Generalized Intersection over Union" (Rezatofighi et al.)
// ============================================================

// ---- Types --------------------------------------------------

export interface Box2D {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Box3D {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
}

export interface IoUResult {
  iou: number;
  giou: number;
  lossIoU: number;
  lossGIoU: number;
}

// ---- 2D -----------------------------------------------------

/**
 * Computes IoU and GIoU loss for two 2D bounding boxes.
 * @param bp - Predicted bounding box (x1, y1, x2, y2)
 * @param bg - Ground truth bounding box (x1, y1, x2, y2)
 * @returns IoU, GIoU, L_IoU, L_GIoU
 */
export function giou2D(bp: Box2D, bg: Box2D): IoUResult {
  // Step 1: Ensure predicted box has valid orientation
  const px1 = Math.min(bp.x1, bp.x2);
  const px2 = Math.max(bp.x1, bp.x2);
  const py1 = Math.min(bp.y1, bp.y2);
  const py2 = Math.max(bp.y1, bp.y2);

  // Step 2 & 3: Areas of ground truth and predicted boxes
  const ag = (bg.x2 - bg.x1) * (bg.y2 - bg.y1);
  const ap = (px2 - px1) * (py2 - py1);

  // Step 4: Intersection
  const xi1 = Math.max(px1, bg.x1);
  const xi2 = Math.min(px2, bg.x2);
  const yi1 = Math.max(py1, bg.y1);
  const yi2 = Math.min(py2, bg.y2);
  const intersection =
    xi2 > xi1 && yi2 > yi1 ? (xi2 - xi1) * (yi2 - yi1) : 0;

  // Step 5 & 6: Smallest enclosing box
  const xc1 = Math.min(px1, bg.x1);
  const xc2 = Math.max(px2, bg.x2);
  const yc1 = Math.min(py1, bg.y1);
  const yc2 = Math.max(py2, bg.y2);
  const ac = (xc2 - xc1) * (yc2 - yc1);

  // Step 7: IoU
  const union = ap + ag - intersection;
  const iou = union === 0 ? 0 : intersection / union;

  // Step 8 & 9: GIoU and losses
  const giou = ac === 0 ? iou : iou - (ac - union) / ac;
  const lossIoU = 1 - iou;
  const lossGIoU = 1 - giou;

  return { iou, giou, lossIoU, lossGIoU };
}

// ---- 3D -----------------------------------------------------

/**
 * Computes IoU and GIoU loss for two 3D bounding boxes.
 * @param bp - Predicted bounding box (x1, y1, z1, x2, y2, z2)
 * @param bg - Ground truth bounding box (x1, y1, z1, x2, y2, z2)
 * @returns IoU, GIoU, L_IoU, L_GIoU
 */
export function giou3D(bp: Box3D, bg: Box3D): IoUResult {
  // Step 1: Ensure predicted box has valid orientation
  const px1 = Math.min(bp.x1, bp.x2);
  const px2 = Math.max(bp.x1, bp.x2);
  const py1 = Math.min(bp.y1, bp.y2);
  const py2 = Math.max(bp.y1, bp.y2);
  const pz1 = Math.min(bp.z1, bp.z2);
  const pz2 = Math.max(bp.z1, bp.z2);

  // Step 2 & 3: Volumes of ground truth and predicted boxes
  const ag = (bg.x2 - bg.x1) * (bg.y2 - bg.y1) * (bg.z2 - bg.z1);
  const ap = (px2 - px1) * (py2 - py1) * (pz2 - pz1);

  // Step 4: Intersection volume
  const xi1 = Math.max(px1, bg.x1);
  const xi2 = Math.min(px2, bg.x2);
  const yi1 = Math.max(py1, bg.y1);
  const yi2 = Math.min(py2, bg.y2);
  const zi1 = Math.max(pz1, bg.z1);
  const zi2 = Math.min(pz2, bg.z2);
  const intersection =
    xi2 > xi1 && yi2 > yi1 && zi2 > zi1
      ? (xi2 - xi1) * (yi2 - yi1) * (zi2 - zi1)
      : 0;

  // Step 5 & 6: Smallest enclosing box volume
  const xc1 = Math.min(px1, bg.x1);
  const xc2 = Math.max(px2, bg.x2);
  const yc1 = Math.min(py1, bg.y1);
  const yc2 = Math.max(py2, bg.y2);
  const zc1 = Math.min(pz1, bg.z1);
  const zc2 = Math.max(pz2, bg.z2);
  const ac = (xc2 - xc1) * (yc2 - yc1) * (zc2 - zc1);

  // Step 7: IoU
  const union = ap + ag - intersection;
  const iou = union === 0 ? 0 : intersection / union;

  // Step 8 & 9: GIoU and losses
  const giou = ac === 0 ? iou : iou - (ac - union) / ac;
  const lossIoU = 1 - iou;
  const lossGIoU = 1 - giou;

  return { iou, giou, lossIoU, lossGIoU };
}