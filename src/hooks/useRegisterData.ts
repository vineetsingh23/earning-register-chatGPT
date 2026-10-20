import { useCallback, useEffect, useRef, useState } from "react";
import {
  supabaseClient,
  pullStationData,
  pushStationData,
  rememberSyncedState,
} from "../lib/supabaseSync";
import {
  createEmptyRegisterState,
  type RegisterState,
} from "../lib/registerTypes";

export type SyncStatus =
  | "localOnly"
  | "loading"
  | "saving"
  | "synced"
  | "error";

// data of one station: kept in the browser and synced to Supabase (when configured)
export function useRegisterData(stationName: string) {
  const browserStorageKey = `metro-react-${stationName}`;
  const [registerState, setRegisterState] = useState<RegisterState>(() => {
    try {
      return {
        ...createEmptyRegisterState(),
        ...JSON.parse(localStorage.getItem(browserStorageKey) || "{}"),
      };
    } catch {
      return createEmptyRegisterState();
    }
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    supabaseClient ? "loading" : "localOnly",
  );
  const latestStateReference = useRef(registerState);
  latestStateReference.current = registerState;
  const skipNextSave = useRef(true);

  // load from Supabase when the station opens
  useEffect(() => {
    if (!supabaseClient) return;
    let isStillCurrent = true;
    (async () => {
      try {
        const pulledState = await pullStationData(stationName);
        if (!isStillCurrent) return;
        const databaseHasData =
          Object.keys(pulledState.shiftEntries!).length ||
          Object.keys(pulledState.tvmEntries!).length ||
          Object.keys(pulledState.cashCounts!).length;
        if (databaseHasData) {
          const mergedState = {
            ...createEmptyRegisterState(),
            ...pulledState,
          } as RegisterState;
          rememberSyncedState(stationName, mergedState);
          skipNextSave.current = true;
          setRegisterState(mergedState);
        } else {
          await pushStationData(stationName, latestStateReference.current); // first time: upload what is on this device
        }
        if (isStillCurrent) setSyncStatus("synced");
      } catch (error) {
        console.error(error);
        if (isStillCurrent) setSyncStatus("error");
      }
    })();
    return () => {
      isStillCurrent = false;
    };
  }, [stationName]);

  const saveNow = useCallback(async () => {
    if (!supabaseClient) return;
    try {
      await pushStationData(stationName, latestStateReference.current);
      setSyncStatus("synced");
    } catch (error) {
      console.error(error);
      setSyncStatus("error");
    }
  }, [stationName]);

  // save in the browser at once, send to Supabase one second after the last change
  useEffect(() => {
    try {
      localStorage.setItem(browserStorageKey, JSON.stringify(registerState));
    } catch {
      /* storage full or blocked */
    }
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (!supabaseClient) return;
    setSyncStatus("saving");
    const delayedSave = setTimeout(saveNow, 1000);
    return () => clearTimeout(delayedSave);
  }, [registerState]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateRegisterState = useCallback(
    (applyChange: (draftState: RegisterState) => void) =>
      setRegisterState((previousState) => {
        const draftState = structuredClone(previousState);
        applyChange(draftState);
        return draftState;
      }),
    [],
  );

  return { registerState, updateRegisterState, syncStatus, saveNow };
}
