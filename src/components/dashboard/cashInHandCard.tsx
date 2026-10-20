import type { BankTransfer } from "../../lib/registerTypes";
import { formatRupees } from "../../lib/earningCalculations";
import { cardClass,primaryButtonClass, summaryRowClass } from "../uiStyles";


interface CashInHandCardProps {
  totalCashInHand: number;
  previousDayEarning: number;
  currentDayEarning: number;
  amountDueToBank: number;
  existingTransfer: BankTransfer | undefined;
  canSendToBank: boolean;
  onSendToBankClick: () => void;
}

export default function CashInHandCard({
  totalCashInHand,
  previousDayEarning,
  currentDayEarning,
  amountDueToBank,
  existingTransfer,
  canSendToBank,
  onSendToBankClick,
}: CashInHandCardProps) {
  return (
   
    <div className={`${cardClass} w-75 gap-3`}>
      <small className="block text-mu">
        Total cash in hand (previous day + current day earning)
      </small>
      <div className="text-[26px] font-bold text-ac">
        {formatRupees(totalCashInHand)}
      </div>
      <div className={summaryRowClass}>
        <span>Previous day earning</span>
        <b>{formatRupees(previousDayEarning)}</b>
      </div>
      <div className={summaryRowClass}>
        <span>Current day earning</span>
        <b>{formatRupees(currentDayEarning)}</b>
      </div>
      <div className={summaryRowClass}>
        <span>
          Sent to bank
          {existingTransfer ? ` · slip ${existingTransfer.slipNumber}` : ""}
        </span>
        <b>{formatRupees(existingTransfer ? existingTransfer.amount : 0)}</b>
      </div>
      <div className={summaryRowClass}>
        <span>Due to bank (total cash in hand, rounded down to ₹100)</span>
        <b>{formatRupees(amountDueToBank)}</b>
      </div>

      <div className="py-2">
        <button
          className={primaryButtonClass}
          disabled={!canSendToBank}
          onClick={onSendToBankClick}
        >
          🏦 Send {formatRupees(amountDueToBank)} to bank
        </button>
      </div>
      <div className={summaryRowClass}>
        <span>Bank slip no.</span>
        <b>{existingTransfer ? existingTransfer.slipNumber : "—"}</b>
      </div>
    </div>

    

  );
}
