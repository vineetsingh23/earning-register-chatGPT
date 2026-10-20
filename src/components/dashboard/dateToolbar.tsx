import { useRef } from "react";
import type { RegisterState } from "../../lib/registerTypes";
import { addDays } from "../../lib/earningCalculations";
import {
  exportBackupAsJson,
  exportRowsAsCsv,
  importBackupFromJson,
} from "../../handlers/dataTransferHandlers";
import { fillMonthWithSampleData } from "../../lib/sampleDataGenerator";
import { dateInputClass, secondaryButtonClass } from "../uiStyles";

interface DateToolbarProps {
  stationName: string;
  date: string;
  onDateChange: (date: string) => void;
  syncStatusText: string;
  registerState: RegisterState;
  updateRegisterState: (
    applyChange: (draftState: RegisterState) => void,
  ) => void;
}
const rowsOfDateWithRowNumber = (
  entriesOfDate: RegisterState["shiftEntries"][string] | undefined,
  date: string,
) =>
  Object.entries(entriesOfDate ?? {}).map(([rowIndex, row]) => ({
    date,
    row: Number(rowIndex) + 1,
    ...row,
  }));

export default function DateToolbar({
  stationName,
  date,
  onDateChange,
  syncStatusText,
  registerState,
  updateRegisterState,
}: DateToolbarProps) {
  const backupFileInput = useRef<HTMLInputElement>(null);
  return (
    <div className="mb-5 rounded-2xl border border-line bg-panel p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Station dashboard
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {stationName}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {syncStatusText}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={secondaryButtonClass}
            onClick={() => onDateChange(addDays(date, -1))}
            aria-label="Previous day"
          >
            ←
          </button>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className={dateInputClass}
          />
          <button
            className={secondaryButtonClass}
            onClick={() => onDateChange(addDays(date, 1))}
            aria-label="Next day"
          >
            →
          </button>
          <button
            className={secondaryButtonClass}
            onClick={() =>
              updateRegisterState((draftState) =>
                fillMonthWithSampleData(draftState, date),
              )
            }
          >
            ＋ Sample month
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
        <span className="mr-1 self-center text-xs font-bold uppercase tracking-wider text-muted">
          Data
        </span>
        <button
          className={secondaryButtonClass}
          onClick={() => exportBackupAsJson(stationName, registerState)}
        >
          ↓ JSON
        </button>
        <button
          className={secondaryButtonClass}
          onClick={() =>
            exportRowsAsCsv(
              `${stationName}-shift-${date}.csv`,
              rowsOfDateWithRowNumber(registerState.shiftEntries[date], date),
            )
          }
        >
          ↓ Shift CSV
        </button>
        <button
          className={secondaryButtonClass}
          onClick={() =>
            exportRowsAsCsv(
              `${stationName}-tvm-${date}.csv`,
              rowsOfDateWithRowNumber(registerState.tvmEntries[date], date),
            )
          }
        >
          ↓ TVM CSV
        </button>
        <button
          className={secondaryButtonClass}
          onClick={() => backupFileInput.current?.click()}
        >
          ↑ Import JSON
        </button>
        <input
          ref={backupFileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => {
            const chosenFile = event.target.files?.[0];
            event.target.value = "";
            if (!chosenFile) return;
            importBackupFromJson(chosenFile, (backupData) => {
              if (confirm(`Replace the data of ${stationName} with this file?`))
                updateRegisterState((draftState) => {
                  Object.assign(draftState, backupData);
                });
            });
          }}
        />
      </div>
    </div>
  );
}
