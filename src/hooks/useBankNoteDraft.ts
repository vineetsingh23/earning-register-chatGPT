import { useEffect, useMemo, useState } from "react";
import type { BankTransfer } from "../lib/registerTypes";
import { bankNoteValues } from "../lib/businessRules";
import { parseNumber } from "../lib/earningColumns";
import {
  findNotesExceedingStock,
  suggestBankNoteCounts,
  sumNoteCounts,
} from "../handlers/cashToBankHandlers";

// note counts shown in the cash-to-bank card: automatic until the user types, fixed once sent
export function useBankNoteDraft(
  date: string,
  cashCountsInHand: Record<string, number>,
  amountDueToBank: number,
  existingTransfer: BankTransfer | undefined,
) {
  const [typedCounts, setTypedCounts] = useState<Record<string, string> | null>(
    null,
  ); // null = automatic split
  useEffect(() => setTypedCounts(null), [date]);

  const suggestedNoteCounts = useMemo(
    () => suggestBankNoteCounts(cashCountsInHand, amountDueToBank),
    [cashCountsInHand, amountDueToBank],
  );
  const noteCountsToSend: Record<number, number> = existingTransfer
    ? (existingTransfer.noteCounts as Record<number, number>)
    : Object.fromEntries(
        bankNoteValues.map((noteValue) => [
          noteValue,
          typedCounts
            ? parseNumber(typedCounts[noteValue])
            : suggestedNoteCounts[noteValue],
        ]),
      );

  const inputValueFor = (noteValue: number) =>
    typedCounts
      ? (typedCounts[noteValue] ?? "")
      : String(suggestedNoteCounts[noteValue] || "");
  const changeNoteCount = (noteValue: number, typedValue: string) => {
    const startingCounts =
      typedCounts ??
      Object.fromEntries(
        bankNoteValues.map((value) => [
          value,
          String(suggestedNoteCounts[value]),
        ]),
      );
    setTypedCounts({ ...startingCounts, [noteValue]: typedValue });
  };
  return {
    noteCountsToSend,
    noteTotalToSend: sumNoteCounts(noteCountsToSend),
    notesExceedingStock: findNotesExceedingStock(
      noteCountsToSend,
      cashCountsInHand,
    ),
    inputValueFor,
    changeNoteCount,
    resetToSuggestedCounts: () => setTypedCounts(null),
  };
}
