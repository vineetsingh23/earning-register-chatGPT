import {
  formatRupees,
  looseCoinsKey,
  noteRows,
  totalImprestIssued,
  type Imprest,
} from "../../lib/earningCalculations";
import {
  cardClass,
  cardStatitics,
  countInputClass,
  tableCellClass,
  tableHeaderCellClass,
  tableLabelCellClass,
  totalRowClass,
} from "../uiStyles";
interface CashInPossessionCardProps {
  cashCountsInHand: Record<string, number>;
  coinTotalAmount: number;
  looseCoinAmount: number;
  denominationTotalAmount: number;
  totalCashInHand: number;

  imprestRows: readonly Imprest[];
  onCountChange: (countKey: string, typedValue: string) => void;
}

export default function CashInPossessionCard({
  cashCountsInHand,
  coinTotalAmount,
  looseCoinAmount,
  denominationTotalAmount,
  totalCashInHand,
  imprestRows,
  onCountChange,
}: CashInPossessionCardProps) {
  const matchesCashInHand = denominationTotalAmount === totalCashInHand;
  const totalCashInPossession =
    denominationTotalAmount + totalImprestIssued(imprestRows);

  return (
    <div className={cardStatitics}>


    <div className={cardClass}>
      <h2 className="mb-2 font-semibold">Cash in possession · notes</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={tableHeaderCellClass}>Note/Coin</th>
            <th className={tableHeaderCellClass}>Count</th>
            <th className={tableHeaderCellClass}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {noteRows.map((noteRow) => (
            <tr key={noteRow.key} className="even:bg-tz">
              <td className={tableLabelCellClass}>{noteRow.label}</td>
              <td className={tableCellClass}>
                <input
                  className={countInputClass}
                  inputMode="numeric"
                  value={cashCountsInHand[noteRow.key] || ""}
                  placeholder="0"
                  onChange={(event) =>
                    onCountChange(noteRow.key, event.target.value)
                  }
                />
              </td>
              <td className={tableCellClass}>
                {formatRupees(
                  noteRow.value * (cashCountsInHand[noteRow.key] ?? 0),
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td className={tableLabelCellClass}>Coins (from Coins card)</td>
            <td className={tableCellClass}>—</td>
            <td className={tableCellClass}>{formatRupees(coinTotalAmount)}</td>
          </tr>
          <tr className="even:bg-tz">
            <td className={tableLabelCellClass}>Loose coins (amount ₹)</td>
            <td className={tableCellClass}>
              <input
                className={countInputClass}
                inputMode="decimal"
                value={looseCoinAmount || ""}
                placeholder="0"
                onChange={(event) =>
                  onCountChange(looseCoinsKey, event.target.value)
                }
              />
            </td>
            <td className={tableCellClass}>{formatRupees(looseCoinAmount)}</td>
          </tr>
          
          <tr>
            <td className={tableLabelCellClass}>Total Imprest Issued</td>
            <td className={tableCellClass}>—</td>
            <td className={tableCellClass}>
              {formatRupees(totalImprestIssued(imprestRows))}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className={totalRowClass}>
            <td className={tableLabelCellClass} colSpan={2}>
              Total
            </td>
            <td className={tableCellClass}>
              {formatRupees(totalCashInPossession)}
            </td>
          </tr>
        </tfoot>
      </table>
      <small className={matchesCashInHand ? "text-ok" : "text-bad"}>
        {matchesCashInHand
          ? "✓ Matches total cash in hand"
          : `Differs from cash in hand by ${formatRupees(denominationTotalAmount - totalCashInHand)}`}
      </small>
    </div>
        </div>
  );
}
