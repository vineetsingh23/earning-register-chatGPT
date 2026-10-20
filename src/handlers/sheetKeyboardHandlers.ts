import type { KeyboardEvent } from "react";

// Arrow / Enter / Tab navigation for any table whose cells carry data-grid (table name), data-row and data-column
export function handleSheetKeyDown(event: KeyboardEvent<HTMLElement>) {
  const focusedCell = event.target as HTMLInputElement | HTMLSelectElement;
  const gridName = focusedCell.dataset?.grid;
  if (!gridName) return;
  const pressedKey = event.key;
  if (
    focusedCell.tagName === "SELECT" &&
    (pressedKey === "ArrowUp" || pressedKey === "ArrowDown")
  )
    return; // keep the dropdown usable
  let rowIndex = Number(focusedCell.dataset.row),
    columnIndex = Number(focusedCell.dataset.column);
  const gridElement = event.currentTarget;
  const lastColumnIndex =
    gridElement.querySelectorAll(`[data-grid="${gridName}"][data-row="0"]`)
      .length - 1;
  if (pressedKey === "ArrowDown" || (pressedKey === "Enter" && !event.shiftKey))
    rowIndex++;
  else if (
    pressedKey === "ArrowUp" ||
    (pressedKey === "Enter" && event.shiftKey)
  )
    rowIndex--;
  else if (pressedKey === "ArrowRight") columnIndex++;
  else if (pressedKey === "ArrowLeft") columnIndex--;
  else if (pressedKey === "Tab") {
    if (event.shiftKey) {
      columnIndex--;
      if (columnIndex < 0) {
        columnIndex = lastColumnIndex;
        rowIndex--;
      }
    } else {
      columnIndex++;
      if (columnIndex > lastColumnIndex) {
        columnIndex = 0;
        rowIndex++;
      }
    }
  } else return;
  const targetCell = gridElement.querySelector<HTMLInputElement>(
    `[data-grid="${gridName}"][data-row="${rowIndex}"][data-column="${columnIndex}"]`,
  );
  if (!targetCell) return;
  event.preventDefault();
  targetCell.focus();
  targetCell.select?.();
}
