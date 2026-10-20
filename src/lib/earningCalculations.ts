import type { RegisterRow, RegisterState } from "./registerTypes";
import {
  addValueNet,
  cashDepositedByOperator,
  cashlessTotal,
  parseNumber,
  penaltyTotal,
  surchargeTotal,
  ticketSaleNet,
  totalEarning,
  type ColumnLeaf,
} from "./earningColumns";

export interface DenominationRow {
  key: string;
  value: number;
  label: string;
}
export const noteRows: DenominationRow[] = [500, 200, 100, 50, 20, 10].map(
  (value) => ({ key: String(value), value, label: `₹${value} note` }),
);
export const coinRows: DenominationRow[] = [20, 10, 5, 2, 1].map((value) => ({
  key: `coin${value}`,
  value,
  label: `₹${value} coin`,
}));
export const allDenominationRows: DenominationRow[] = [
  ...noteRows,
  ...coinRows,
];
export const looseCoinsKey = "looseCoins";

export const toIsoDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
export const addDays = (isoDate: string, dayCount: number) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + dayCount);
  return toIsoDate(date);
};
export const formatRupees = (amount: unknown) =>
  "₹" + Math.round(parseNumber(amount)).toLocaleString("en-IN");
export const allDatesInMonth = (isoDate: string) => {
  const [year, month] = isoDate.split("-").map(Number);
  return Array.from(
    { length: new Date(year, month, 0).getDate() },
    (_, dayIndex) =>
      `${isoDate.slice(0, 7)}-${String(dayIndex + 1).padStart(2, "0")}`,
  );
};
// qty columns show plain numbers, amounts show rupees
export const formatCellValue = (column: ColumnLeaf, value: string | number) =>
  column.kind === "text" ||
  (/Qty/.test(column.label) && !/Amt/.test(column.label))
    ? String(value)
    : formatRupees(value);

export const sumTvmForDate = (state: RegisterState, date: string) => {
  const totals: Record<string, number> = {};
  Object.values(state.tvmEntries[date] ?? {}).forEach((entryRow) =>
    Object.entries(entryRow).forEach(([fieldKey, value]) => {
      if (fieldKey !== "no")
        totals[fieldKey] = (totals[fieldKey] ?? 0) + parseNumber(value);
    }),
  );
  return totals;
};

// TVM totals counted as one extra shift row in the day's earning
const tvmTotalsAsShiftRow = (
  tvmTotals: Record<string, number>,
): RegisterRow => {
  const read = (fieldKey: string) => tvmTotals[fieldKey] ?? 0;
  const converted = {
    a: read("qa"),
    aq: read("qq"),
    h1q: read("vq") + read("rq"),
    h1: read("va") + read("ra"),
    h2q: read("nq"),
    h2: read("na"),
    ab1: read("pos"),
    ab2: read("up"),
    aj: read("os"),
  };
  return Object.fromEntries(
    Object.entries(converted).map(([fieldKey, value]) => [
      fieldKey,
      String(value),
    ]),
  );
};
export const shiftRowsIncludingTvm = (
  state: RegisterState,
  date: string,
): RegisterRow[] => [
  ...Object.values(state.shiftEntries[date] ?? {}),
  tvmTotalsAsShiftRow(sumTvmForDate(state, date)),
];

export const aggregateEarnings = (state: RegisterState, date: string) => {
  const totals = {
    ticketSale: 0,
    addValue: 0,
    surcharge: 0,
    penalty: 0,
    cashless: 0,
    totalEarning: 0,
    cashDeposited: 0,
    qrSaleAmount: 0,
  };
  shiftRowsIncludingTvm(state, date).forEach((row) => {
    totals.ticketSale += ticketSaleNet(row);
    totals.addValue += addValueNet(row);
    totals.surcharge += surchargeTotal(row);
    totals.penalty += penaltyTotal(row);
    totals.cashless += cashlessTotal(row);
    totals.totalEarning += totalEarning(row);
    totals.cashDeposited += cashDepositedByOperator(row);
    totals.qrSaleAmount += parseNumber(row.a);
  });
  return totals;
};
export const outsourceEarningForDate = (state: RegisterState, date: string) =>
  (state.detailLists[date]?.outsourceEarning ?? []).reduce(
    (total, listRow) => total + parseNumber(listRow?.[1]),
    0,
  );
export const finalCashEarningForDate = (state: RegisterState, date: string) =>
  aggregateEarnings(state, date).cashDeposited +
  outsourceEarningForDate(state, date);

// split an amount into notes and coins, largest first
export const breakIntoDenominations = (
  amount: number,
): Record<string, number> => {
  const counts: Record<string, number> = {};
  allDenominationRows.forEach((row) => {
    counts[row.key] = 0;
  });
  let remaining = amount;
  [500, 200, 100, 50, 20, 10, 5, 2, 1].forEach((value) => {
    const key = value >= 10 ? String(value) : `coin${value}`;
    counts[key] = Math.floor(remaining / value);
    remaining -= counts[key] * value;
  });
  return counts;
};

//imprest table calculations

export interface Imprest {
 
  tomName: string;
  imprestIssued: number;
  advanceIssued: number;
}

export type AmountField = "imprestIssued" | "advanceIssued";

export const ImprestTable: Imprest[] = [
  {tomName: "CC-80", imprestIssued: 500, advanceIssued: 5000 },
  {tomName: "CC-81", imprestIssued: 500, advanceIssued: 5000 },
  {tomName: "TOM-51", imprestIssued: 0, advanceIssued: 5000 },
  {tomName: "TOM-52", imprestIssued: 0, advanceIssued: 5000 },
];

export const imprestRow = (row: Imprest) =>
  row.imprestIssued + row.advanceIssued;

export const totalImprestIssued = (rows: readonly Imprest[]) =>
  rows.reduce((total, row) => total + imprestRow(row), 0);
console.log(totalImprestIssued)