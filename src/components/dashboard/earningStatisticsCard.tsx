import type { RegisterState } from "../../lib/registerTypes";
import {
  aggregateEarnings,
  formatRupees,
  sumTvmForDate,
} from "../../lib/earningCalculations";
import { cardClass,cardStatitics } from "../uiStyles";

interface EarningStatisticsCardProps {
  registerState: RegisterState;
  date: string;
}
type BestDay = [string, number] | null;

// date with the highest value of some measure, among the given dates (days without value are ignored)
function findBestDay(
  dates: string[],
  measureOfDate: (date: string) => number,
): BestDay {
  let bestDay: BestDay = null;
  dates.forEach((date) => {
    const measuredValue = measureOfDate(date);
    if (measuredValue > 0 && (!bestDay || measuredValue > bestDay[1]))
      bestDay = [date, measuredValue];
  });
  return bestDay;
}

export default function EarningStatisticsCard({
  registerState,
  date,
}: EarningStatisticsCardProps) {
  const datesUpToSelected = [
    ...new Set([
      ...Object.keys(registerState.shiftEntries),
      ...Object.keys(registerState.tvmEntries),
    ]),
  ]
    .filter((entryDate) => entryDate <= date)
    .sort();
  const datesInSelectedMonth = datesUpToSelected.filter((entryDate) =>
    entryDate.startsWith(date.slice(0, 7)),
  );
  const statistics: [string, BestDay][] = [
    [
      "Highest earning · this month",
      findBestDay(
        datesInSelectedMonth,
        (entryDate) => aggregateEarnings(registerState, entryDate).totalEarning,
      ),
    ],
    [
      "Highest earning · till date",
      findBestDay(
        datesUpToSelected,
        (entryDate) => aggregateEarnings(registerState, entryDate).totalEarning,
      ),
    ],
    [
      "Highest QR sale · this month",
      findBestDay(
        datesInSelectedMonth,
        (entryDate) => aggregateEarnings(registerState, entryDate).qrSaleAmount,
      ),
    ],
    [
      "Highest QR sale · till date",
      findBestDay(
        datesUpToSelected,
        (entryDate) => aggregateEarnings(registerState, entryDate).qrSaleAmount,
      ),
    ],
    [
      "Highest QR sale from TVM · till date",
      findBestDay(
        datesUpToSelected,
        (entryDate) => sumTvmForDate(registerState, entryDate).qa ?? 0,
      ),
    ],
    [
      "Highest Add Value from TVM · till date",
      findBestDay(
        datesUpToSelected,
        (entryDate) => sumTvmForDate(registerState, entryDate).va ?? 0,
      ),
    ],
  ];
  return (
    <div className={cardStatitics}>
      <h2 className="mb-2 font-semibold">Statistics</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
        {statistics.map(([statisticTitle, bestDay]) => (
          <div key={statisticTitle} className={cardClass}>
            <small className="block text-mu">{statisticTitle}</small>
            {bestDay ? (
              <>
                <b className="text-xl">{formatRupees(bestDay[1])}</b>
                <small className="block text-mu">{bestDay[0]}</small>
              </>
            ) : (
              <b>—</b>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
