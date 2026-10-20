import type { RegisterState } from "../lib/registerTypes";
import { bankNoteValues } from "../lib/businessRules";
import {
  breakIntoDenominations,
  coinRows,
  looseCoinsKey,
} from "../lib/earningCalculations";

// as many ₹500 notes as are in hand, then ₹200, then ₹100 (no ₹50)
export function suggestBankNoteCounts(
  cashCountsInHand: Record<string, number>,
  amountToBank: number,
): Record<number, number> {
  let remainingAmount = amountToBank;
  const suggestedCounts: Record<number, number> = {};
  bankNoteValues.forEach((noteValue) => {
    const notesTaken = Math.min(
      cashCountsInHand[String(noteValue)] ?? 0,
      Math.floor(remainingAmount / noteValue),
    );
    suggestedCounts[noteValue] = notesTaken;
    remainingAmount -= notesTaken * noteValue;
  });
  // not enough notes in hand: the rest is still shown in 500 / 200 / 100
  bankNoteValues.forEach((noteValue) => {
    const extraNotes = Math.floor(remainingAmount / noteValue);
    suggestedCounts[noteValue] += extraNotes;
    remainingAmount -= extraNotes * noteValue;
  });
  return suggestedCounts;
}

export const sumNoteCounts = (noteCounts: Record<number, number>) =>
  bankNoteValues.reduce(
    (total, noteValue) => total + noteValue * (noteCounts[noteValue] ?? 0),
    0,
  );
export const findNotesExceedingStock = (
  noteCounts: Record<number, number>,
  cashCountsInHand: Record<string, number>,
) =>
  bankNoteValues.filter(
    (noteValue) =>
      (noteCounts[noteValue] ?? 0) > (cashCountsInHand[String(noteValue)] ?? 0),
  );

export interface BankTransferRequest {
  date: string;
  amountToBank: number;
  slipNumber: string;
  noteCountsToSend: Record<number, number>;
  cashCountsInHand: Record<string, number>;
  totalCashInHand: number;
}

// saves the transfer and takes the sent notes out of cash in possession
export function recordBankTransfer(
  state: RegisterState,
  request: BankTransferRequest,
) {
  const {
    date,
    amountToBank,
    slipNumber,
    noteCountsToSend,
    cashCountsInHand,
    totalCashInHand,
  } = request;
  let remainingCounts = { ...(state.cashCounts[date] ?? cashCountsInHand) };
  const exceedsStock =
    findNotesExceedingStock(noteCountsToSend, cashCountsInHand).length > 0;
  if (exceedsStock) {
    // more notes sent than counted in hand: re-break what is left and keep coins and loose coins
    const coinAmount = coinRows.reduce(
      (total, coinRow) =>
        total + coinRow.value * (cashCountsInHand[coinRow.key] ?? 0),
      0,
    );
    const looseCoinAmount = cashCountsInHand[looseCoinsKey] ?? 0;
    remainingCounts = breakIntoDenominations(
      Math.max(
        0,
        totalCashInHand - amountToBank - coinAmount - looseCoinAmount,
      ),
    );
    coinRows.forEach((coinRow) => {
      remainingCounts[coinRow.key] =
        (remainingCounts[coinRow.key] ?? 0) +
        (cashCountsInHand[coinRow.key] ?? 0);
    });
    remainingCounts[looseCoinsKey] = looseCoinAmount;
  } else {
    bankNoteValues.forEach((noteValue) => {
      remainingCounts[String(noteValue)] =
        (remainingCounts[String(noteValue)] ?? 0) -
        (noteCountsToSend[noteValue] ?? 0);
    });
  }
  state.cashCounts[date] = remainingCounts;
  state.bankTransfers[date] = {
    amount: amountToBank,
    slipNumber,
    noteCounts: Object.fromEntries(
      Object.entries(noteCountsToSend).map(([noteValue, count]) => [
        noteValue,
        count,
      ]),
    ),
    sentAt: new Date().toISOString(),
  };
}
