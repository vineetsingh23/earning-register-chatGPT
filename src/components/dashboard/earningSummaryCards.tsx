import type { aggregateEarnings } from "../../lib/earningCalculations";
import { formatRupees } from "../../lib/earningCalculations";
import { cardClass, cardStatitics } from "../uiStyles";

interface EarningSummaryCardsProps {
  date: string;
  earningTotals: ReturnType<typeof aggregateEarnings>;
}

export default function EarningSummaryCards({
  date,
  earningTotals,
}: EarningSummaryCardsProps) {
  const smallCards: [string, number, string][] = [
    ["Ticket sale", earningTotals.ticketSale, "Net"],
    ["Add value", earningTotals.addValue, "Net"],
    ["Surcharge", earningTotals.surcharge, "Fees"],
    ["Penalty", earningTotals.penalty, "Recovery"],
    ["Cashless", earningTotals.cashless, "CD"],
    ["Cash deposited", earningTotals.cashDeposited, "Operators"],
  ];
  return (
    <section className={cardStatitics}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className=''>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Earnings overview
          </div>
          <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-ink">
            Daily performance
          </h2>
        </div>
        <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-semibold text-muted">
          {date}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand to-brandDark p-4 text-white shadow-lg shadow-brand/15 xl:col-span-1">
          <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-white/10" />
          <small className="relative block text-xs font-semibold text-white/75">
            Total earning
          </small>
          <b className="relative mt-2 block text-2xl font-extrabold tracking-tight">
            {formatRupees(earningTotals.totalEarning)}
          </b>
          <span className="mt-1 block text-[11px] text-white/70">
            Z · selected date
          </span>
        </div>
        {smallCards.map(([cardTitle, amount, note]) => (
          <div key={cardTitle} className={`${cardClass} min-w-0`}>
            <div className="flex items-center justify-between gap-1">
              <small className="truncate font-semibold text-muted">
                {cardTitle}
              </small>
              <span className="rounded-full bg-field px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted">
                {note}
              </span>
            </div>
            <b className="mt-2 block truncate text-lg font-extrabold text-ink">
              {formatRupees(amount)}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}
