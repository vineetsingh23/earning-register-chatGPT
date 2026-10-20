import type { BankTransfer } from "../../lib/registerTypes";
import type { useBankNoteDraft } from "../../hooks/useBankNoteDraft";
import { bankNoteValues } from "../../lib/businessRules";
import { formatRupees } from "../../lib/earningCalculations";
import {
  cardClass,
  countInputClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeaderCellClass,
  tableLabelCellClass,
  totalRowClass,
} from "../uiStyles";

interface CashToBankCardProps {
  existingTransfer: BankTransfer | undefined;
  amountDueToBank: number;
  noteDraft: ReturnType<typeof useBankNoteDraft>;
}

export default function CashToBankCard({
  existingTransfer,
  amountDueToBank,
  noteDraft,
}: CashToBankCardProps) {
  const {
    noteCountsToSend,
    noteTotalToSend,
    notesExceedingStock,
    inputValueFor,
    changeNoteCount,
    resetToSuggestedCounts,
  } = noteDraft;
  const matchesAmountDue =
    noteTotalToSend === amountDueToBank && notesExceedingStock.length === 0;
  return (
    <div className={`${cardClass} w-75`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Cash to bank · denominations</h2>
        {!existingTransfer && (
          <button
            className={secondaryButtonClass}
            onClick={resetToSuggestedCounts}
          >
            Auto calculate
          </button>
        )}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={tableHeaderCellClass}>Note</th>
            <th className={tableHeaderCellClass}>Count</th>
            <th className={tableHeaderCellClass}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {bankNoteValues.map((noteValue) => (
            <tr key={noteValue} className="even:bg-tz">
              <td className={tableLabelCellClass}>₹{noteValue} note</td>
              <td className={tableCellClass}>
                {existingTransfer ? (
                  (noteCountsToSend[noteValue] ?? 0)
                ) : (
                  <input
                    className={countInputClass}
                    inputMode="numeric"
                    value={inputValueFor(noteValue)}
                    onChange={(event) =>
                      changeNoteCount(noteValue, event.target.value)
                    }
                  />
                )}
              </td>
              <td className={tableCellClass}>
                {formatRupees(noteValue * (noteCountsToSend[noteValue] ?? 0))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={totalRowClass}>
            <td className={tableLabelCellClass} colSpan={2}>
              Total {existingTransfer ? "sent" : "entered"}
            </td>
            <td className={tableCellClass}>
              {formatRupees(
                existingTransfer ? existingTransfer.amount : noteTotalToSend,
              )}
            </td>
          </tr>
        </tfoot>
      </table>
      {existingTransfer ? (
        <small className="text-ok">
          ✓ Sent · slip {existingTransfer.slipNumber}
        </small>
      ) : (
        <small className={matchesAmountDue ? "text-ok" : "text-bad"}>
          {notesExceedingStock.length
            ? `Count is more than cash in hand for ₹${notesExceedingStock.join(", ₹")}`
            : noteTotalToSend === amountDueToBank
              ? `✓ Matches amount due ${formatRupees(amountDueToBank)}`
              : `Enter notes totalling ${formatRupees(amountDueToBank)} (entered ${formatRupees(noteTotalToSend)})`}
        </small>
      )}
    </div>
  );
}
