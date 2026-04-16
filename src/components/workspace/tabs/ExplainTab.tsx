export function ExplainTab() {
  return (
    <div className="tab-content">
      <h4 className="tab-section-title">Explanation</h4>
      <div className="tab-placeholder">
        <h5>What is GIoU?</h5>
        <p>
          Generalized Intersection over Union (GIoU) extends the standard IoU
          metric by also penalising the empty space within the smallest
          enclosing box of two bounding boxes.
        </p>
        <h5>Formula</h5>
        <p className="formula">
          GIoU = IoU &minus; (|C \ (A &cup; B)|) / |C|
        </p>
        <p className="tab-hint">
          Where C is the smallest enclosing box, A and B are the two bounding boxes.
        </p>
      </div>
    </div>
  );
}
