import EarningSheetTable from "./earningSheetTable";
import EntryToolbar from "./entryToolbar";
import type { RegisterState } from "../lib/registerTypes";
import { parseNumber, type ColumnNode } from "../lib/earningColumns";
import { coinRows, formatCellValue, formatRupees } from "../lib/earningCalculations";

import { updateEntryCell } from "../handlers/entryCellHandlers";
import { cardClass, cardStatitics, secondaryButtonClass,tableHeaderCellClass, tableLabelCellClass,tableCellClass, countInputClass, totalRowClass } from "./uiStyles";
// import {
//   cardClass,
//   countInputClass,
//   tableCellClass,
//   tableHeaderCellClass,
//   tableHeaderCellClass,
//   totalRowClass,
// } from "../uiStyles";

interface ShiftEntryPageProps {
  registerState: RegisterState;
  updateRegisterState: (
    applyChange: (draftState: RegisterState) => void,
  ) => void;
  date: string;
  onDateChange: (date: string) => void;
  columns: ColumnNode[];
  syncStatusText: string;
  canSaveNow: boolean;
  onSaveNow: () => void;
}

export default function ShiftEntryPage({
  registerState,
  updateRegisterState,
  date,
  onDateChange,
  columns,
  syncStatusText,
  canSaveNow,
  onSaveNow,
}: ShiftEntryPageProps) {
  const shiftRows = registerState.shiftEntries[date] ?? {};
  return (
    <>
      <EntryToolbar
        date={date}
        onDateChange={onDateChange}
        syncStatusText={syncStatusText}
        canSaveNow={canSaveNow}
        onSaveNow={onSaveNow}
      />
      <EarningSheetTable
        gridName="shift"
        columns={columns}
        rowCount={registerState.shiftRowCount}
        readEntryValue={(rowIndex, fieldKey) =>
          shiftRows[rowIndex]?.[fieldKey] ?? ""
        }
        writeEntryValue={(rowIndex, fieldKey, newValue) =>
          updateRegisterState((draftState) =>
            updateEntryCell(
              draftState.shiftEntries,
              date,
              rowIndex,
              fieldKey,
              newValue,
            ),
          )
        }
        renderCalculatedValue={(rowIndex, column) =>
          formatRupees(column.formula!(shiftRows[rowIndex] ?? {}))
        }
        renderTotalValue={(column) => {
          const columnTotal = Object.values(shiftRows).reduce(
            (runningTotal, row) =>
              runningTotal +
              (column.kind === "calculated"
                ? column.formula!(row)
                : parseNumber(row[column.fieldKey])),
            0,
          );
          return formatCellValue(column, columnTotal);
        }}
      />
      <button
        className={`${secondaryButtonClass} mt-3`}
        onClick={() =>
          updateRegisterState((draftState) => {
            draftState.shiftRowCount++;
          })
        }
      >
        + Add row
      </button>
        

    </>
  );
}
