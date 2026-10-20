import { memo, useMemo, useRef, type ReactNode } from "react";
import {
  collectLeafColumns,
  columnDepth,
  isColumnGroup,
  type ColumnLeaf,
  type ColumnNode,
} from "../lib/earningColumns";
import { handleSheetKeyDown } from "../handlers/sheetKeyboardHandlers";

const headerCellBaseClass =
  "border border-line px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide min-w-[60px] text-muted";
const bodyCellClass =
  "border border-line px-1.5 py-1 text-right text-[13px] whitespace-nowrap transition-shadow duration-200 hover:ring-2 hover:ring-inset hover:ring-brand/30";
// every top-level header group gets its own colour (its sub-headers share it)
const headerGroupColorClasses = [
  "bg-teal-50 dark:bg-teal-900/40",
  "bg-emerald-50 dark:bg-teal-900/50",
  "bg-amber-50 dark:bg-teal-900/40",
  "bg-lime-100 dark:bg-teal-900/50",
  "bg-violet-50 dark:bg-teal-900/40",
  "bg-slate-100 dark:bg-teal-900/50",
];

function buildHeaderRows(columns: ColumnNode[]): ReactNode[][] {
  const headerLevelCount = Math.max(...columns.map(columnDepth));
  const headerRows: ReactNode[][] = Array.from(
    { length: headerLevelCount },
    () => [],
  );
  (function addHeaders(
    nodes: ColumnNode[],
    levelIndex: number,
    parentColorIndex: number,
  ) {
    nodes.forEach((node, nodeIndex) => {
      const headerKey = `${levelIndex}-${nodeIndex}-${node.label}`;
      const colorIndex = levelIndex
        ? parentColorIndex
        : nodeIndex % headerGroupColorClasses.length;
      const headerClass = `${headerCellBaseClass} ${headerGroupColorClasses[colorIndex]}`;
      if (isColumnGroup(node)) {
        headerRows[levelIndex].push(
          <th
            key={headerKey}
            colSpan={collectLeafColumns(node).length}
            className={headerClass}
          >
            {node.label}
          </th>,
        );
        addHeaders(node.children, levelIndex + 1, colorIndex);
      } else {
        headerRows[levelIndex].push(
          <th
            key={headerKey}
            rowSpan={headerLevelCount - levelIndex}
            className={headerClass}
          >
            {node.label}
          </th>,
        );
      }
    });
  })(columns, 0, 0);
  return headerRows;
}

type WriteEntryValue = (
  rowIndex: number,
  fieldKey: string,
  newValue: string,
) => void;
interface EditableCellProps {
  gridName: string;
  rowIndex: number;
  columnIndex: number;
  fieldKey: string;
  isNumeric: boolean;
  isAlternateRow: boolean;
  value: string;
  writeValueReference: { current: WriteEntryValue | undefined };
}
const EditableCell = memo(
  function EditableCell({
    gridName,
    rowIndex,
    columnIndex,
    fieldKey,
    isNumeric,
    isAlternateRow,
    value,
    writeValueReference,
  }: EditableCellProps) {
    return (
      <td
        className={`${bodyCellClass} ${isAlternateRow ? "bg-stripe" : "bg-field"}`}
      >
        <input
          data-grid={gridName}
          data-row={rowIndex}
          data-column={columnIndex}
          value={value}
          inputMode={isNumeric ? "decimal" : "text"}
          onFocus={(event) => event.target.select()}
          onChange={(event) =>
            writeValueReference.current?.(
              rowIndex,
              fieldKey,
              event.target.value,
            )
          }
          className={`w-full bg-transparent p-1 outline-hidden focus:bg-card focus:ring-2 focus:ring-ac ${isNumeric ? "min-w-[64px] text-right" : "min-w-[110px] text-left"}`}
        />
      </td>
    );
  },
  (previous, next) =>
    previous.value === next.value &&
    previous.isAlternateRow === next.isAlternateRow &&
    previous.rowIndex === next.rowIndex &&
    previous.columnIndex === next.columnIndex &&
    previous.fieldKey === next.fieldKey &&
    previous.gridName === next.gridName,
);

export interface EarningSheetTableProps {
  gridName: string;
  columns: ColumnNode[];
  rowCount: number;
  readEntryValue?: (rowIndex: number, fieldKey: string) => string; // editable sheet: current value
  writeEntryValue?: WriteEntryValue; // editable sheet: change handler
  renderViewValue?: (rowIndex: number, column: ColumnLeaf) => string; // read-only sheet: shown value
  renderCalculatedValue: (rowIndex: number, column: ColumnLeaf) => string; // calculated (shaded) cells
  renderTotalValue?: (column: ColumnLeaf) => string; // total row at the bottom
  renderRowLabel?: (rowIndex: number) => string;
}

export default function EarningSheetTable(props: EarningSheetTableProps) {
  const leafColumns = useMemo(
    () => props.columns.flatMap(collectLeafColumns),
    [props.columns],
  );
  const headerRows = useMemo(
    () => buildHeaderRows(props.columns),
    [props.columns],
  );
  const writeValueReference = useRef(props.writeEntryValue);
  writeValueReference.current = props.writeEntryValue;

  let inputColumnCounter = -1;
  const columnsWithInputIndex = leafColumns.map((column) => ({
    column,
    inputColumnIndex: column.kind === "calculated" ? -1 : ++inputColumnCounter,
  }));

  return (
    <div
      onKeyDown={handleSheetKeyDown}
      className="max-h-[72vh] overflow-auto rounded-2xl border border-bd bg-card shadow-sm pb-5"
    >
      <table className="w-full border-collapse">
        <thead>
          {headerRows.map((headerRow, headerRowIndex) => (
            <tr key={headerRowIndex}>
              {headerRowIndex === 0 && (
                <th
                  rowSpan={headerRows.length}
                  className={`${headerCellBaseClass} dark:bg-brandSoft`}
                >
                  #
                </th>
              )}
              {headerRow}
            </tr>
          ))}
        </thead>
        <tbody>
          {Array.from({ length: props.rowCount }, (_, rowIndex) => {
            const isAlternateRow = rowIndex % 2 === 1;
            return (
              <tr key={rowIndex}>
                <td
                  className={`${bodyCellClass} ${isAlternateRow ? "bg-stripe" : "bg-field"} text-left!`}
                >
                  {props.renderRowLabel
                    ? props.renderRowLabel(rowIndex)
                    : rowIndex + 1}
                </td>
                {columnsWithInputIndex.map(({ column, inputColumnIndex }) => {
                  if (column.kind === "calculated") {
                    return (
                      <td
                        key={column.fieldKey}
                        className={`${bodyCellClass} ${isAlternateRow ? "bg-calc!" : "bg-brandSoft!"} font-semibold`}
                      >
                        {props.renderCalculatedValue(rowIndex, column)}
                      </td>
                    );
                  }
                  if (props.writeEntryValue) {
                    return (
                      <EditableCell
                        key={column.fieldKey}
                        gridName={props.gridName}
                        rowIndex={rowIndex}
                        columnIndex={inputColumnIndex}
                        fieldKey={column.fieldKey}
                        isNumeric={column.kind === "number"}
                        isAlternateRow={isAlternateRow}
                        value={props.readEntryValue!(rowIndex, column.fieldKey)}
                        writeValueReference={writeValueReference}
                      />
                    );
                  }
                  return (
                    <td
                      key={column.fieldKey}
                      className={`${bodyCellClass} ${isAlternateRow ? "bg-stripe" : "bg-field"}`}
                    >
                      {props.renderViewValue?.(rowIndex, column) ?? ""}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        {props.renderTotalValue && (
          <tfoot>
            <tr>
              <td
                className={`${bodyCellClass} bg-brandSoft! font-bold text-left!`}
              >
                Total
              </td>
              {leafColumns.map((column) => (
                <td
                  key={column.fieldKey}
                  className={`${bodyCellClass} bg-brandSoft! font-bold`}
                >
                  {column.kind === "text"
                    ? ""
                    : props.renderTotalValue!(column)}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
