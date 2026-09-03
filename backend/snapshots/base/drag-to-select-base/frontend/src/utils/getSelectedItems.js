export function getSelectedItems(selectionRect, items) {
  const selection = normalizeRect(selectionRect);

  return items
    .filter((item) => {
      const rect = normalizeRect(item);
      return (
        rect.left < selection.right &&
        rect.right > selection.left &&
        rect.top < selection.bottom &&
        rect.bottom > selection.top
      );
    })
    .map((item) => item.id);
}

function normalizeRect(rect) {
  const left = Math.min(rect.left, rect.right);
  const right = Math.max(rect.left, rect.right);
  const top = Math.min(rect.top, rect.bottom);
  const bottom = Math.max(rect.top, rect.bottom);

  return { left, right, top, bottom };
}
