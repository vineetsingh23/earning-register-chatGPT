import { useMemo, useState } from "react";
import DashboardPage from "./dashboard/dashboardPage";
import ShiftEntryPage from "./shiftEntryPage";
import TvmEarningPage from "./tvmEarningPage";
import FinalEarning from "./finalEarning";
import { useRegisterData, type SyncStatus } from "../hooks/useRegisterData";
import type { StationRecord } from "../lib/registerTypes";
import { filterByFacilities, shiftEntryColumns } from "../lib/earningColumns";
import { toIsoDate } from "../lib/earningCalculations";
import { primaryButtonClass, secondaryButtonClass } from "./uiStyles";

const pageTitles = ["Dashboard", "Shift Entry", "TVM Earning", "Final Earning"];
const pageIcons = ["⌂", "▦", "▤", "✓"];
const syncStatusTexts: Record<SyncStatus, string> = {
  localOnly: "Local only",
  loading: "Loading…",
  saving: "Saving…",
  synced: "Synced",
  error: "Cloud error · local save",
};

interface RegisterWorkspaceProps {
  station: StationRecord;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export default function RegisterWorkspace({
  station,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
}: RegisterWorkspaceProps) {
  const { registerState, updateRegisterState, syncStatus, saveNow } =
    useRegisterData(station.name);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()));
  const visibleShiftColumns = useMemo(
    () =>
      filterByFacilities(shiftEntryColumns, {
        hasSv4Recharge: station.has_sv4,
        hasParking: station.has_parking,
      }),
    [station],
  );
  const syncStatusText = syncStatusTexts[syncStatus];
  const isWideLayout = activePageIndex >= 1;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-panel/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1800px] items-center gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-lg font-black text-white shadow-sm shadow-brand/20">
              M
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-sm font-extrabold tracking-tight text-ink">
                Metro Earnings
              </div>
              <div className="truncate text-[11px] font-medium uppercase tracking-wider text-muted">
                Daily register
              </div>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-line md:block" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-ink">
              {station.name}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <span
                className={`h-1.5 w-1.5 rounded-full ${syncStatus === "error" ? "bg-danger" : "bg-success"}`}
              />
              {syncStatusText}
            </div>
          </div>
          <nav className="order-3 flex w-full gap-1 overflow-x-auto border-t border-line pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
            {pageTitles.map((pageTitle, pageIndex) => (
              <button
                key={pageTitle}
                className={
                  activePageIndex === pageIndex
                    ? "inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand dark:bg-brand/60 px-3 py-2 text-sm font-bold text-white  shadow-sm"
                    : "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-brandSoft hover:text-brand"
                }
                onClick={() => setActivePageIndex(pageIndex)}
              >
                <span className="text-xs">{pageIcons[pageIndex]}</span>
                {pageTitle}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <button
              className={secondaryButtonClass}
              onClick={onToggleDarkMode}
              title="Switch dark / light mode"
            >
              <span aria-hidden>{isDarkMode ? "☀" : "☾"}</span>
              <span className="hidden lg:inline">
                {isDarkMode ? "Light" : "Dark"}
              </span>
            </button>
            <button className={secondaryButtonClass} onClick={onLogout}>
              <span aria-hidden>↪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main
        className={`mx-auto px-3 py-5 sm:px-6 sm:py-6 ${isWideLayout ? "max-w-[1800px]" : "max-w-[1400px]"}`}
      >
        {activePageIndex === 0 && (
          <DashboardPage
            registerState={registerState}
            updateRegisterState={updateRegisterState}
            date={selectedDate}
            onDateChange={setSelectedDate}
            stationName={station.name}
            syncStatusText={syncStatusText}
          />
        )}
        {activePageIndex === 1 && (
          <ShiftEntryPage
            registerState={registerState}
            updateRegisterState={updateRegisterState}
            date={selectedDate}
            onDateChange={setSelectedDate}
            columns={visibleShiftColumns}
            syncStatusText={syncStatusText}
            canSaveNow={syncStatus === "saving"}
            onSaveNow={saveNow}
          />
        )}
        {activePageIndex === 2 && (
          <TvmEarningPage
            registerState={registerState}
            updateRegisterState={updateRegisterState}
            date={selectedDate}
            onDateChange={setSelectedDate}
            syncStatusText={syncStatusText}
            canSaveNow={syncStatus === "saving"}
            onSaveNow={saveNow}
          />
        )}
        {activePageIndex === 3 && (
          <FinalEarning
            registerState={registerState}
            date={selectedDate}
            onDateChange={setSelectedDate}
            shiftColumns={visibleShiftColumns}
            syncStatusText={syncStatusText}
          />
        )}
      </main>
    </div>
  );
}
