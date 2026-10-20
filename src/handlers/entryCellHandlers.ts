import type { RegisterRow } from "../lib/registerTypes";

type EntriesByDate = Record<string, Record<number, RegisterRow>>;

// writes one typed value into a shift or TVM entry sheet
export function updateEntryCell(
  entriesByDate: EntriesByDate,
  date: string,
  rowIndex: number,
  fieldKey: string,
  newValue: string,
) {
  const entriesOfDate = (entriesByDate[date] ??= {});
  (entriesOfDate[rowIndex] ??= {})[fieldKey] = newValue;
}
