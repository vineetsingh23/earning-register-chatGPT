import { useState } from "react";
import {
  ImprestTable,
  type AmountField,
  type Imprest as ImprestRow,
} from "../../lib/earningCalculations";
import type { DetailListKind, RegisterState } from "../../lib/registerTypes";
import { bankRoundingAmount } from "../../lib/businessRules";
import { useDashboardFigures } from "../../hooks/useDashboardFigures";
import { useBankNoteDraft } from "../../hooks/useBankNoteDraft";
import { recordBankTransfer } from "../../handlers/cashToBankHandlers";
import { updateCashCount } from "../../handlers/cashCountHandlers";
import { updateDetailListCell } from "../../handlers/detailListHandlers";
import DateToolbar from "./dateToolbar";
import EarningSummaryCards from "./earningSummaryCards";
import EarningStatisticsCard from "./earningStatisticsCard";
import CashInHandCard from "./cashInHandCard";
import CashInPossessionCard from "./cashInPossessionCard";
import CoinsCard from "./coinsCard";
import CashToBankCard from "./cashToBankCard";
import SendToBankDialog from "./sendToBankDialog";
import DetailListCard from "./detailListCard";
import EarningHistogramCard from "./earningHistogramCard";
import Imprest from "./issuedImprest";
import { cardStatitics } from "../uiStyles";

interface DashboardPageProps {
  registerState: RegisterState;
  updateRegisterState: (
    applyChange: (draftState: RegisterState) => void,
  ) => void;
  date: string;
  onDateChange: (date: string) => void;
  stationName: string;
  syncStatusText: string;
}

export default function DashboardPage({
  registerState,
  updateRegisterState,
  date,
  onDateChange,
  stationName,
  syncStatusText,
}: DashboardPageProps) {
  const [imprestRows, setImprestRows] = useState<ImprestRow[]>(ImprestTable);
  const figures = useDashboardFigures(registerState, date);
  const noteDraft = useBankNoteDraft(
    date,
    figures.cashCountsInHand,
    figures.amountDueToBank,
    figures.existingTransfer,
  );
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  // enabled when 100 or more is in hand and nothing was sent to the bank that day
  const canSendToBank =
    !figures.existingTransfer && figures.amountDueToBank >= bankRoundingAmount;

  const changeCashCount = (countKey: string, typedValue: string) =>
    updateRegisterState((draftState) =>
      updateCashCount(
        draftState,
        date,
        figures.cashCountsInHand,
        countKey,
        typedValue,
      ),
    );
  const changeImprestAmount = (
    rowIndex: number,
    field: AmountField,
    typedValue: string,
  ) => {
    const amount = typedValue === "" ? 0 : Number(typedValue) || 0;
    setImprestRows((currentRows) =>
      currentRows.map((row, index) =>
        index === rowIndex ? { ...row, [field]: amount } : row,
      ),
    );
  };
  const confirmBankTransfer = (slipNumber: string) => {
    updateRegisterState((draftState) =>
      recordBankTransfer(draftState, {
        date,
        amountToBank: figures.amountDueToBank,
        slipNumber,
        noteCountsToSend: noteDraft.noteCountsToSend,
        cashCountsInHand: figures.cashCountsInHand,
        totalCashInHand: figures.totalCashInHand,
      }),
    );
    setIsSendDialogOpen(false);
  };
  const renderDetailList = (
    title: string,
    listKind: DetailListKind,
    columnTitles: string[],
  ) => (
    <DetailListCard
      title={title}
      listKind={listKind}
      columnTitles={columnTitles}
      listRows={registerState.detailLists[date]?.[listKind] ?? []}
      onCellChange={(rowIndex, columnIndex, newValue) =>
        updateRegisterState((draftState) =>
          updateDetailListCell(
            draftState,
            date,
            listKind,
            rowIndex,
            columnIndex,
            newValue,
          ),
        )
      }
    />
  );

  return (
    <div className="space-y-3">
      <DateToolbar
        stationName={stationName}
        date={date}
        onDateChange={onDateChange}
        syncStatusText={syncStatusText}
        registerState={registerState}
        updateRegisterState={updateRegisterState}
      />
      <EarningSummaryCards date={date} earningTotals={figures.earningTotals} />
      <EarningStatisticsCard registerState={registerState} date={date} />

      <div className={`grid grid-cols-2 gap-3 max-w-fit ${cardStatitics}`}>
        <CashInHandCard
          totalCashInHand={figures.totalCashInHand}
          previousDayEarning={figures.previousDayEarning}
          currentDayEarning={figures.currentDayEarning}
          amountDueToBank={figures.amountDueToBank}
          existingTransfer={figures.existingTransfer}
          canSendToBank={canSendToBank}
          onSendToBankClick={() => setIsSendDialogOpen(true)}
        />
        <CashToBankCard
          existingTransfer={figures.existingTransfer}
          amountDueToBank={figures.amountDueToBank}
          noteDraft={noteDraft}
        />
      </div>

      <div className="">
        <CashInPossessionCard
          cashCountsInHand={figures.cashCountsInHand}
          coinTotalAmount={figures.coinTotalAmount}
          looseCoinAmount={figures.looseCoinAmount}
          denominationTotalAmount={figures.denominationTotalAmount}
          totalCashInHand={figures.totalCashInHand}
          imprestRows={imprestRows}
          onCountChange={changeCashCount}
        />
        <Imprest rows={imprestRows} onAmountChange={changeImprestAmount} />
        
        <CoinsCard
          cashCountsInHand={figures.cashCountsInHand}
          coinTotalAmount={figures.coinTotalAmount}
          onCountChange={changeCashCount}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
        {renderDetailList("Details of out-source earning", "outsourceEarning", [
          "Item",
          "Amount",
        ])}
        {renderDetailList("Details of misc earning", "miscEarning", [
          "Reason",
          "Amount",
        ])}
      </div>
      {renderDetailList("Penalty details", "penaltyDetails", [
        "ID",
        "Date & time",
        "Penalty section",
        "Passenger name",
        "Passenger contact no.",
        "Address of passenger",
        "Penalty amount",
      ])}
      <EarningHistogramCard registerState={registerState} date={date} />

      {isSendDialogOpen && (
        <SendToBankDialog
          amountDueToBank={figures.amountDueToBank}
          totalCashInHand={figures.totalCashInHand}
          noteTotalToSend={noteDraft.noteTotalToSend}
          onClose={() => setIsSendDialogOpen(false)}
          onConfirm={confirmBankTransfer}
        />
      )}
    </div>
  );
}
