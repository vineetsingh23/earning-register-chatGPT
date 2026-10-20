import type { RegisterState } from "../../lib/registerTypes";
import {
  addDays,
  aggregateEarnings,
  formatRupees,
} from "../../lib/earningCalculations";
import { cardClass } from "../uiStyles";

interface EarningHistogramCardProps {
  registerState: RegisterState;
  date: string;
}
const daysShown = 14,
  chartWidth = 600,
  chartHeight = 180;

// bars for the 14 days up to the selected date: total earning and cashless earning side by side
export default function EarningHistogramCard({
  registerState,
  date,
}: EarningHistogramCardProps) {
  const dailyFigures = Array.from({ length: daysShown }, (_, dayIndex) => {
    const dayDate = addDays(date, dayIndex - (daysShown - 1)),
      dayTotals = aggregateEarnings(registerState, dayDate);
    return {
      dayDate,
      totalEarning: dayTotals.totalEarning,
      cashless: dayTotals.cashless,
    };
  });
  const highestValue = Math.max(
    1,
    ...dailyFigures.map((figures) =>
      Math.max(figures.totalEarning, figures.cashless),
    ),
  );
  const slotWidth = chartWidth / daysShown,
    barWidth = (slotWidth - 10) / 2,
    barAreaHeight = chartHeight - 30;
  return (
    <div className={cardClass}>
      <h2 className="font-semibold">
        Daily earning histogram ({daysShown} days to {date})
      </h2>
      <small className="text-mu">
        <span className="text-ac2">■</span> Total earning (Z) ·{" "}
        <span className="text-ac">■</span> selected day ·{" "}
        <span className="text-green-600">■</span> Cashless (CD)
      </small>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" role="img">
        {dailyFigures.map(({ dayDate, totalEarning, cashless }, dayIndex) => {
          const earningBarHeight =
              (Math.max(0, totalEarning) / highestValue) * barAreaHeight,
            cashlessBarHeight =
              (Math.max(0, cashless) / highestValue) * barAreaHeight;
          return (
            <g key={dayDate}>
              <rect
                x={dayIndex * slotWidth + 5}
                y={chartHeight - 20 - earningBarHeight}
                width={barWidth}
                height={earningBarHeight}
                rx={2}
                fill={dayDate === date ? "var(--ac)" : "var(--ac2)"}
              >
                <title>{`${dayDate} total earning: ${formatRupees(totalEarning)}`}</title>
              </rect>
              <rect
                x={dayIndex * slotWidth + 5 + barWidth}
                y={chartHeight - 20 - cashlessBarHeight}
                width={barWidth}
                height={cashlessBarHeight}
                rx={2}
                fill="#2e9e5b"
              >
                <title>{`${dayDate} cashless: ${formatRupees(cashless)}`}</title>
              </rect>
              <text
                x={dayIndex * slotWidth + slotWidth / 2}
                y={chartHeight - 6}
                fontSize={10}
                textAnchor="middle"
                fill="var(--mu)"
              >
                {dayDate.slice(8)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
