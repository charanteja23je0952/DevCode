import { useMemo, useRef, useState } from 'react';
import { getSelectedItems } from './utils/getSelectedItems';

const ITEMS = Array.from({ length: 12 }, (_, index) => ({
  id: `card-${index + 1}`,
  label: `Card ${index + 1}`,
}));

const CARD_W = 100;
const CARD_H = 68;
const GAP = 16;

const itemRects = ITEMS.map((item, index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);

  const left = column * (CARD_W + GAP);
  const top = row * (CARD_H + GAP);

  return {
    ...item,
    left,
    top,
    right: left + CARD_W,
    bottom: top + CARD_H,
  };
});

export default function App() {
  const gridRef = useRef(null);
  const [selected, setSelected] = useState(new Set());
  const [drag, setDrag] = useState(null);

  const selectedCount = selected.size;

  const selectionBox = useMemo(() => {
    if (!drag) return null;

    return {
      left: Math.min(drag.startX, drag.currentX),
      top: Math.min(drag.startY, drag.currentY),
      width: Math.abs(drag.currentX - drag.startX),
      height: Math.abs(drag.currentY - drag.startY),
    };
  }, [drag]);

  const getLocalPoint = (event) => {
    const bounds = gridRef.current.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    const point = getLocalPoint(event);
    gridRef.current.setPointerCapture(event.pointerId);
    setDrag({
      startX: point.x,
      startY: point.y,
      currentX: point.x,
      currentY: point.y,
    });
  };

  const handlePointerMove = (event) => {
    if (!drag) return;
    const point = getLocalPoint(event);

    const nextDrag = { ...drag, currentX: point.x, currentY: point.y };
    setDrag(nextDrag);

    const rect = {
      left: drag.startX,
      top: drag.startY,
      right: point.x,
      bottom: point.y,
    };

    setSelected(new Set(getSelectedItems(rect, itemRects)));
  };

  const finishDrag = (event) => {
    if (!drag) return;
    try {
      gridRef.current.releasePointerCapture(event.pointerId);
    } catch {}
    setDrag(null);
  };

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Interaction</p>
        <h1>Drag to select</h1>
        <p className="description">
          Drag across the grid to select every card the rectangle overlaps.
        </p>

        <div
          ref={gridRef}
          className="grid"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          {itemRects.map((item) => (
            <div
              key={item.id}
              className={`item ${selected.has(item.id) ? 'selected' : ''}`}
              style={{
                left: item.left,
                top: item.top,
                width: CARD_W,
                height: CARD_H,
              }}
            >
              {item.label}
            </div>
          ))}

          {selectionBox && (
            <div
              className="selection"
              style={{
                left: selectionBox.left,
                top: selectionBox.top,
                width: selectionBox.width,
                height: selectionBox.height,
              }}
            />
          )}
        </div>

        <div className="footer">
          {selectedCount} {selectedCount === 1 ? 'card' : 'cards'} selected
        </div>
      </section>
    </main>
  );
}
