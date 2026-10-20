import type { DetailListKind, RegisterState } from "../lib/registerTypes";

// writes one typed value into out-source earning, misc earning or penalty details
export function updateDetailListCell(
  state: RegisterState,
  date: string,
  listKind: DetailListKind,
  rowIndex: number,
  columnIndex: number,
  newValue: string,
) {
  const listsOfDate = (state.detailLists[date] ??= {});
  const listRows = (listsOfDate[listKind] ??= []);
  (listRows[rowIndex] ??= [])[columnIndex] = newValue;
}
