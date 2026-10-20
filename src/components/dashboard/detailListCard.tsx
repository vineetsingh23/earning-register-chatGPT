import type { DetailListKind } from "../../lib/registerTypes";
import { penaltySections } from "../../lib/businessRules";
import { handleSheetKeyDown } from "../../handlers/sheetKeyboardHandlers";
import { cardClass, tableHeaderCellClass } from "../uiStyles";

interface DetailListCardProps {
  title: string;
  listKind: DetailListKind;
  columnTitles: string[];
  listRows: string[][];
  onCellChange: (
    rowIndex: number,
    columnIndex: number,
    newValue: string,
  ) => void;
}
const detailListRowCount = 5;
const detailCellClass =
  "w-full min-w-[110px] bg-transparent p-1 outline-hidden focus:bg-card focus:ring-2 focus:ring-ac";

// editable list: out-source earning, misc earning or penalty details (penalty section is a dropdown)
export default function DetailListCard({
  title,
  listKind,
  columnTitles,
  listRows,
  onCellChange,
}: DetailListCardProps) {
  const penaltySectionColumnIndex = 2,
    penaltyDateTimeColumnIndex = 1;
  return (
    <div
      className={`${cardClass} overflow-auto`}
      onKeyDown={handleSheetKeyDown}
    >
      <h2 className="mb-2 font-semibold">{title}</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columnTitles.map((columnTitle) => (
              <th key={columnTitle} className={tableHeaderCellClass}>
                {columnTitle}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: detailListRowCount }, (_, rowIndex) => (
            <tr
              key={rowIndex}
              className="transition duration-300 even:bg-tz hover:translate-x-1 hover:bg-ca"
            >
              {columnTitles.map((columnTitle, columnIndex) => (
                <td key={columnTitle} className="border border-bl p-0">
                  {listKind === "penaltyDetails" &&
                  columnIndex === penaltySectionColumnIndex ? (
                    <select
                      data-grid={listKind}
                      data-row={rowIndex}
                      data-column={columnIndex}
                      value={listRows[rowIndex]?.[columnIndex] ?? ""}
                      onChange={(event) =>
                        onCellChange(rowIndex, columnIndex, event.target.value)
                      }
                      className={`${detailCellClass} min-w-[170px]`}
                    >
                      <option value="">Select section</option>
                      {penaltySections.map((penaltySection) => (
                        <option key={penaltySection}>{penaltySection}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      data-grid={listKind}
                      data-row={rowIndex}
                      data-column={columnIndex}
                      value={listRows[rowIndex]?.[columnIndex] ?? ""}
                      placeholder={
                        listKind === "penaltyDetails" &&
                        columnIndex === penaltyDateTimeColumnIndex
                          ? "DD-MM-YYYY HH:MM"
                          : ""
                      }
                      onFocus={(event) => event.target.select()}
                      onChange={(event) =>
                        onCellChange(rowIndex, columnIndex, event.target.value)
                      }
                      className={`${detailCellClass} ${columnIndex === columnTitles.length - 1 ? "text-right" : ""}`}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
