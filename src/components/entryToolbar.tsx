import { dateInputClass, primaryButtonClass } from "./uiStyles";

interface EntryToolbarProps {
  date: string;
  onDateChange: (date: string) => void;
  syncStatusText: string;
  canSaveNow: boolean;
  onSaveNow: () => void;
}

export default function EntryToolbar({
  date,
  onDateChange,
  syncStatusText,
  canSaveNow,
  onSaveNow,
}: EntryToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel p-3 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted">
          Register date
        </div>
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className={dateInputClass}
        />
      </div>
      <button
        className={`${primaryButtonClass} mt-4`}
        disabled={!canSaveNow}
        onClick={onSaveNow}
      >
        💾 Save changes
      </button>
      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-brandSoft px-3 py-1.5 text-xs font-semibold text-brand">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        {syncStatusText}
      </span>
    </div>
  );
}
