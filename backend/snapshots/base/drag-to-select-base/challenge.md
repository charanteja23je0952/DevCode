# Challenge: Drag-to-Select

The grid interaction works, but the selection rectangle does not reliably select every card it passes over.

Implement the missing logic in:

frontend/src/utils/getSelectedItems.js

The function receives the current selection rectangle and the measured rectangles of the grid items. It should return the IDs of the items that are selected by the drag.

The selection must work regardless of drag direction and should include items whose area is actually overlapped by the selection rectangle — the item's rectangle and the selection rectangle must overlap with positive area, merely touching at an edge does not count.

Do not change the existing pointer interaction or UI.
