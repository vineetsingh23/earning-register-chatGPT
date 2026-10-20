import { useMemo } from "react";
import type { RegisterState } from "../lib/registerTypes";
import { bankRoundingAmount } from "../lib/businessRules";
import {
  addDays,
  aggregateEarnings,
  allDenominationRows,
  breakIntoDenominations,
  coinRows,
  finalCashEarningForDate,
  looseCoinsKey,
  outsourceEarningForDate,
} from "../lib/earningCalculations";

// every number shown on the dashboard for one date
export function useDashboardFigures(
  registerState: RegisterState,
  date: string,
) {
  return useMemo(() => {
    const earningTotals = aggregateEarnings(registerState, date);
    const currentDayEarning =
      earningTotals.cashDeposited +
      outsourceEarningForDate(registerState, date);
    const previousDayEarning = finalCashEarningForDate(
      registerState,
      addDays(date, -1),
    );
    const existingTransfer = registerState.bankTransfers[date];
    const cashBeforeBankTransfer = Math.round(
      previousDayEarning + currentDayEarning,
    );
    const totalCashInHand =
      cashBeforeBankTransfer - (existingTransfer ? existingTransfer.amount : 0);
    const amountDueToBank =
      Math.floor(Math.max(0, cashBeforeBankTransfer) / bankRoundingAmount) *
      bankRoundingAmount;
    const cashCountsInHand =
      registerState.cashCounts[date] ??
      breakIntoDenominations(Math.max(0, totalCashInHand));
    const coinTotalAmount = coinRows.reduce(
      (total, coinRow) =>
        total + coinRow.value * (cashCountsInHand[coinRow.key] ?? 0),
      0,
    );
    const looseCoinAmount = cashCountsInHand[looseCoinsKey] ?? 0;
    const denominationTotalAmount =
      allDenominationRows.reduce(
        (total, row) => total + row.value * (cashCountsInHand[row.key] ?? 0),
        0,
      ) + looseCoinAmount;
    return {
      earningTotals,
      currentDayEarning,
      previousDayEarning,
      existingTransfer,
      totalCashInHand,
      amountDueToBank,
      cashCountsInHand,
      coinTotalAmount,
      looseCoinAmount,
      denominationTotalAmount,
    };
  }, [registerState, date]);
}
