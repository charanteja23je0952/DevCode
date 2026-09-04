# Challenge: Drag-to-Select

The grid interaction works, but the selection rectangle does not reliably select every card it passes over.

Implement the missing logic in:

frontend/src/utils/getSelectedItems.js

The function receives the current selection rectangle and the measured rectangles of the grid items. It should return the IDs of the items that are selected by the drag.

The selection must work regardless of drag direction and should include items whose area is actually overlapped by the selection rectangle — the item's rectangle and the selection rectangle must overlap with positive area, merely touching at an edge does not count.

Do not change the existing pointer interaction or UI.

## Example

Given this selection rectangle:

```js
{ left: 10, top: 10, right: 100, bottom: 100 }
```

and these items:

```js
[
  { id: 'a', left: 20, top: 20, right: 40, bottom: 40 },
  { id: 'b', left: 90, top: 90, right: 120, bottom: 120 },
  { id: 'c', left: 100, top: 20, right: 120, bottom: 40 }
]
```

the result should be:

```js
['a', 'b']
```

a is completely inside the selection and b has a positive-area overlap. c only touches the selection at its right edge, so it is not selected.
