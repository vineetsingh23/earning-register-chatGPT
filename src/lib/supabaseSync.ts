import { createClient } from "@supabase/supabase-js";
import type { RegisterState, StationRecord } from "./registerTypes";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;
// null when .env is missing: the app then keeps data in the browser only
export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const conflictColumnsByTable: Record<string, string> = {
  shift_entries: "station,entry_date,row_no",
  tvm_entries: "station,entry_date,row_no",
  daily_lists: "station,entry_date,kind",
  cash_counts: "station,entry_date",
  bank_transfers: "station,entry_date",
  station_settings: "station",
};
const detailListKindByDatabaseKind: Record<string, string> = {
  oe: "outsourceEarning",
  ms: "miscEarning",
  pd: "penaltyDetails",
};
const databaseKindByDetailListKind: Record<string, string> = {
  outsourceEarning: "oe",
  miscEarning: "ms",
  penaltyDetails: "pd",
};

export async function fetchStations(): Promise<StationRecord[] | null> {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("stations")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as StationRecord[];
}

async function fetchAllRowsOfStation(
  tableName: string,
  stationName: string,
): Promise<any[]> {
  const collectedRows: any[] = [];
  for (let firstRow = 0; ; firstRow += 1000) {
    const { data, error } = await supabaseClient!
      .from(tableName)
      .select("*")
      .eq("station", stationName)
      .range(firstRow, firstRow + 999);
    if (error) throw error;
    collectedRows.push(...data);
    if (data.length < 1000) break;
  }
  return collectedRows;
}

// Load one station's data and return it in the shape the app uses
export async function pullStationData(
  stationName: string,
): Promise<Partial<RegisterState>> {
  const [shiftRows, tvmRows, listRows, cashRows, bankRows, settingsRows] =
    await Promise.all(
      [
        "shift_entries",
        "tvm_entries",
        "daily_lists",
        "cash_counts",
        "bank_transfers",
        "station_settings",
      ].map((tableName) => fetchAllRowsOfStation(tableName, stationName)),
    );
  const pulledState: Partial<RegisterState> &
    Pick<
      RegisterState,
      | "shiftEntries"
      | "tvmEntries"
      | "detailLists"
      | "cashCounts"
      | "bankTransfers"
    > = {
    shiftEntries: {},
    tvmEntries: {},
    detailLists: {},
    cashCounts: {},
    bankTransfers: {},
  };
  shiftRows.forEach((row) => {
    (pulledState.shiftEntries[row.entry_date] ??= {})[row.row_no] = row.data;
  });
  tvmRows.forEach((row) => {
    (pulledState.tvmEntries[row.entry_date] ??= {})[row.row_no] = row.data;
  });
  listRows.forEach((row) => {
    (pulledState.detailLists[row.entry_date] ??= {})[
      detailListKindByDatabaseKind[row.kind]
    ] = row.rows;
  });
  cashRows.forEach((row) => {
    pulledState.cashCounts[row.entry_date] = row.counts;
  });
  bankRows.forEach((row) => {
    pulledState.bankTransfers[row.entry_date] = {
      amount: Number(row.amount),
      slipNumber: row.slip_no,
      noteCounts: row.denominations,
      sentAt: row.sent_at,
    };
  });
  if (settingsRows[0]) {
    pulledState.shiftRowCount = settingsRows[0].shift_rows;
    pulledState.tvmRowCount = settingsRows[0].tvm_rows;
  }
  return pulledState;
}

interface DatabaseItem {
  tableName: string;
  itemKey: string;
  primaryKey: Record<string, unknown>;
  row: Record<string, unknown>;
}

// Flatten app state into database rows
function flattenStateToDatabaseItems(
  stationName: string,
  state: RegisterState,
): DatabaseItem[] {
  const items: DatabaseItem[] = [];
  const addItem = (
    tableName: string,
    primaryKey: Record<string, unknown>,
    columns: Record<string, unknown>,
  ) =>
    items.push({
      tableName,
      itemKey: `${tableName}|${Object.values(primaryKey).join("|")}`,
      primaryKey,
      row: { station: stationName, ...primaryKey, ...columns },
    });
  Object.entries(state.shiftEntries).forEach(([date, rowsByIndex]) =>
    Object.entries(rowsByIndex).forEach(([rowIndex, data]) =>
      addItem(
        "shift_entries",
        { entry_date: date, row_no: Number(rowIndex) },
        { data },
      ),
    ),
  );
  Object.entries(state.tvmEntries).forEach(([date, rowsByIndex]) =>
    Object.entries(rowsByIndex).forEach(([rowIndex, data]) =>
      addItem(
        "tvm_entries",
        { entry_date: date, row_no: Number(rowIndex) },
        { data },
      ),
    ),
  );
  Object.entries(state.detailLists).forEach(([date, listsByKind]) =>
    Object.entries(listsByKind).forEach(([listKind, rows]) =>
      addItem(
        "daily_lists",
        { entry_date: date, kind: databaseKindByDetailListKind[listKind] },
        { rows },
      ),
    ),
  );
  Object.entries(state.cashCounts).forEach(([date, counts]) =>
    addItem("cash_counts", { entry_date: date }, { counts }),
  );
  Object.entries(state.bankTransfers).forEach(([date, transfer]) =>
    addItem(
      "bank_transfers",
      { entry_date: date },
      {
        amount: transfer.amount,
        slip_no: transfer.slipNumber,
        denominations: transfer.noteCounts,
        sent_at: transfer.sentAt,
      },
    ),
  );
  addItem(
    "station_settings",
    {},
    { shift_rows: state.shiftRowCount, tvm_rows: state.tvmRowCount },
  );
  return items;
}

// remembers what the database already holds, so only changes are sent
const alreadySyncedItems = new Map<
  string,
  {
    serializedRow: string;
    tableName: string;
    primaryKey: Record<string, unknown>;
  }
>();

export function rememberSyncedState(stationName: string, state: RegisterState) {
  alreadySyncedItems.clear();
  flattenStateToDatabaseItems(stationName, state).forEach((item) =>
    alreadySyncedItems.set(item.itemKey, {
      serializedRow: JSON.stringify(item.row),
      tableName: item.tableName,
      primaryKey: item.primaryKey,
    }),
  );
}

export async function pushStationData(
  stationName: string,
  state: RegisterState,
) {
  const client = supabaseClient!;
  await client
    .from("stations")
    .upsert(
      { name: stationName },
      { onConflict: "name", ignoreDuplicates: true },
    );
  const currentItemKeys = new Set<string>(),
    changedItemsByTable: Record<string, DatabaseItem[]> = {};
  for (const item of flattenStateToDatabaseItems(stationName, state)) {
    currentItemKeys.add(item.itemKey);
    if (
      alreadySyncedItems.get(item.itemKey)?.serializedRow !==
      JSON.stringify(item.row)
    )
      (changedItemsByTable[item.tableName] ??= []).push(item);
  }
  for (const tableName in changedItemsByTable) {
    for (
      let firstItem = 0;
      firstItem < changedItemsByTable[tableName].length;
      firstItem += 500
    ) {
      const chunk = changedItemsByTable[tableName].slice(
        firstItem,
        firstItem + 500,
      );
      const { error } = await client.from(tableName).upsert(
        chunk.map((item) => item.row),
        { onConflict: conflictColumnsByTable[tableName] },
      );
      if (error) throw error;
      chunk.forEach((item) =>
        alreadySyncedItems.set(item.itemKey, {
          serializedRow: JSON.stringify(item.row),
          tableName,
          primaryKey: item.primaryKey,
        }),
      );
    }
  }
  for (const [itemKey, syncedItem] of [...alreadySyncedItems]) {
    if (currentItemKeys.has(itemKey)) continue;
    const { error } = await client
      .from(syncedItem.tableName)
      .delete()
      .match({ station: stationName, ...syncedItem.primaryKey });
    if (error) throw error;
    alreadySyncedItems.delete(itemKey);
  }
}
