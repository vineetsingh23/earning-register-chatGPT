import { coinRows, formatRupees } from "../../lib/earningCalculations";
import {
  cardClass,
  countInputClass,
  tableCellClass,
  tableHeaderCellClass,
  tableLabelCellClass,
  totalRowClass,
} from "../uiStyles";

interface CoinsCardProps {
  cashCountsInHand: Record<string, number>;
  coinTotalAmount: number;
  onCountChange: (countKey: string, typedValue: string) => void;
}

export default function CoinsCard({
  cashCountsInHand,
  coinTotalAmount,
  onCountChange,
}: CoinsCardProps) {
  return (
    <div className={cardClass}>
      <h2 className="mb-2 font-semibold">Coins · denominations</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={tableHeaderCellClass}>Coin</th>
            <th className={tableHeaderCellClass}>Count</th>
            <th className={tableHeaderCellClass}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {coinRows.map((coinRow) => (
            <tr key={coinRow.key} className="even:bg-tz">
              <td className={tableLabelCellClass}>{coinRow.label}</td>
              <td className={tableCellClass}>
                <input
                  className={countInputClass}
                  inputMode="numeric"
                  value={cashCountsInHand[coinRow.key] || ""}
                  placeholder="0"
                  onChange={(event) =>
                    onCountChange(coinRow.key, event.target.value)
                  }
                />
              </td>
              <td className={tableCellClass}>
                {formatRupees(
                  coinRow.value * (cashCountsInHand[coinRow.key] ?? 0),
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={totalRowClass}>
            <td className={tableLabelCellClass} colSpan={2}>
              Total coins
            </td>
            <td className={tableCellClass}>{formatRupees(coinTotalAmount)}</td>
          </tr>
        </tfoot>
      </table>
      <small className="text-mu">Included in total cash in hand</small>
    </div>
  );
}
