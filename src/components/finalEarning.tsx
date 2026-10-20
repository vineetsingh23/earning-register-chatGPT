import { useMemo } from "react";
import EarningSheetTable from "./earningSheetTable";
import type { RegisterRow, RegisterState } from "../lib/registerTypes";
import {
  buildFinalEarningColumns,
  collectLeafColumns,
  mergeTvmIntoShiftRow,
  parseNumber,
  tvmFieldPrefix,
  type ColumnNode,
} from "../lib/earningColumns";
import {
  formatCellValue,
  formatRupees,
  sumTvmForDate,
} from "../lib/earningCalculations";
import { dateInputClass } from "./uiStyles";

interface FinalEarningProps {
  registerState: RegisterState;
  date: string;
  onDateChange: (date: string) => void;
  shiftColumns: ColumnNode[];
  syncStatusText: string;
}
// cashless TVM POS / UPI and outstanding show shift + TVM together
const fieldsShownAsShiftPlusTvm = ["ab1", "ab2", "aj"];

// One row of totals: every column is filled from the Shift Entry sheet or the TVM Earning sheet,
// and Total Earning / Cash Deposited are calculated from both.
export default function FinalEarning({
  registerState,
  date,
  onDateChange,
  shiftColumns,
  syncStatusText,
}: FinalEarningProps) {
  const finalColumns = useMemo(
    () => buildFinalEarningColumns(shiftColumns),
    [shiftColumns],
  );
  const { separateTotals, combinedTotals } = useMemo(() => {
    const tvmTotals = sumTvmForDate(registerState, date),
      shiftRows = Object.values(registerState.shiftEntries[date] ?? {});
    const separateTotals: RegisterRow = {};
    finalColumns.flatMap(collectLeafColumns).forEach((column) => {
      if (column.kind !== "number") return;
      separateTotals[column.fieldKey] = String(
        column.fieldKey.startsWith(tvmFieldPrefix)
          ? (tvmTotals[column.fieldKey.slice(tvmFieldPrefix.length)] ?? 0)
          : shiftRows.reduce(
              (runningTotal, row) =>
                runningTotal + parseNumber(row[column.fieldKey]),
              0,
            ),
      );
    });
    // POS, UPI and outstanding of TVM have no column of their own: they go into the cashless / outstanding columns
    ["pos", "up", "os", "qa", "va", "na", "ra"].forEach((tvmField) => {
      separateTotals[tvmFieldPrefix + tvmField] = String(
        tvmTotals[tvmField] ?? 0,
      );
    });
    return {
      separateTotals,
      combinedTotals: mergeTvmIntoShiftRow(separateTotals),
    };
  }, [registerState, date, finalColumns]);

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Summary
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">
            Final Earning
          </h2>
        </div>
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className={dateInputClass}
        />
        <span className="rounded-full bg-brandSoft px-3 py-1.5  text-xs font-semibold text-brand">
          {syncStatusText}
        </span>
      </div>
      <div className="[&_td]:py-3.5 py-3">
        <EarningSheetTable
          gridName="final"
          columns={finalColumns}
          rowCount={1}
          renderRowLabel={() => "Total"}
          renderCalculatedValue={(_, column) =>
            formatRupees(column.formula!(combinedTotals))
          }
          renderViewValue={(_, column) => {
            const shownValue = (
              fieldsShownAsShiftPlusTvm.includes(column.fieldKey)
                ? combinedTotals
                : separateTotals
            )[column.fieldKey];
            return shownValue === undefined
              ? ""
              : formatCellValue(column, shownValue);
          }}
        
        />
      </div>
      <p className="rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-6 text-muted">
        Read-only. Data comes from Shift Entry and TVM Earning for the selected
        date; TVM POS, UPI and outstanding are included in Cashless Details and
        Outstanding Details.
      </p>
    </div>
  );
}
