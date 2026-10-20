import EarningSheetTable from "./earningSheetTable";
import EntryToolbar from "./entryToolbar";
import type { RegisterState } from "../lib/registerTypes";
import { parseNumber, tvmEarningColumns } from "../lib/earningColumns";
import { formatCellValue, formatRupees } from "../lib/earningCalculations";
import { updateEntryCell } from "../handlers/entryCellHandlers";
import { secondaryButtonClass } from "./uiStyles";

interface TvmEarningPageProps {
  registerState: RegisterState;
  updateRegisterState: (
    applyChange: (draftState: RegisterState) => void,
  ) => void;
  date: string;
  onDateChange: (date: string) => void;
  syncStatusText: string;
  canSaveNow: boolean;
  onSaveNow: () => void;
}

export default function TvmEarningPage({
  registerState,
  updateRegisterState,
  date,
  onDateChange,
  syncStatusText,
  canSaveNow,
  onSaveNow,
}: TvmEarningPageProps) {
  const tvmRows = registerState.tvmEntries[date] ?? {};
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
        gridName="tvm"
        columns={tvmEarningColumns}
        rowCount={registerState.tvmRowCount}
        readEntryValue={(rowIndex, fieldKey) =>
          tvmRows[rowIndex]?.[fieldKey] ?? ""
        }
        writeEntryValue={(rowIndex, fieldKey, newValue) =>
          updateRegisterState((draftState) =>
            updateEntryCell(
              draftState.tvmEntries,
              date,
              rowIndex,
              fieldKey,
              newValue,
            ),
          )
        }
        renderCalculatedValue={(rowIndex, column) =>
          formatRupees(column.formula!(tvmRows[rowIndex] ?? {}))
        }
        renderTotalValue={(column) => {
          const columnTotal = Object.values(tvmRows).reduce(
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
            draftState.tvmRowCount++;
          })
        }
      >
        + Add row
      </button>
    </>
  );
}
