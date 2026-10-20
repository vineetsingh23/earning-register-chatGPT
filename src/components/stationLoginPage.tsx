import { useState } from "react";
import type { StationRecord } from "../lib/registerTypes";
import { primaryButtonClass, textInputClass } from "./uiStyles";

interface StationLoginPageProps {
  stations: StationRecord[];
  onLogin: (stationName: string) => void;
}

export default function StationLoginPage({
  stations,
  onLogin,
}: StationLoginPageProps) {
  const [selectedStationName, setSelectedStationName] = useState(
    stations[0]?.name ?? "",
  );
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-bg p-5">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-xl font-black text-white shadow-lg shadow-brand/20">
            <img src="dmrclogo.png" alt="dmrc" />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-ink">
              Metro Earnings
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Register management
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-panel/95 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <div className="mb-7">
            <div className="mb-2 inline-flex rounded-full bg-brandSoft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
              Station access
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-muted">
              Choose your station to open its earning register and daily
              workspace.
            </p>
          </div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">
            Station
          </label>
          <select
            value={selectedStationName}
            onChange={(event) => setSelectedStationName(event.target.value)}
            className={`${textInputClass} mb-4 w-full appearance-auto`}
          >
            {stations.map((station) => (
              <option key={station.name}>{station.name}</option>
            ))}
          </select>
          <button
            className={`${primaryButtonClass} h-11 w-full`}
            onClick={() => selectedStationName && onLogin(selectedStationName)}
          >
            Open register <span aria-hidden>→</span>
          </button>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-success" /> Data is stored
            locally and can sync to the cloud when configured.
          </div>
        </div>
      </div>
    </div>
  );
}
