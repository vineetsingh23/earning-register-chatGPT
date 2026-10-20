export type RegisterRow = Record<string, string>;

export interface BankTransfer {
  amount: number;
  slipNumber: string;
  noteCounts: Record<string, number>;
  sentAt: string | null;
}

export interface RegisterState {
  shiftRowCount: number;
  tvmRowCount: number;
  shiftEntries: Record<string, Record<number, RegisterRow>>; // [date][rowIndex]
  tvmEntries: Record<string, Record<number, RegisterRow>>; // [date][rowIndex]
  detailLists: Record<string, Record<string, string[][]>>; // [date][outsource | misc | penalty]
  cashCounts: Record<string, Record<string, number>>; // cash in possession, [date][denominationKey]
  bankTransfers: Record<string, BankTransfer>; // [date]
}

export const createEmptyRegisterState = (): RegisterState => ({
  shiftRowCount: 15,
  tvmRowCount: 15,
  shiftEntries: {},
  tvmEntries: {},
  detailLists: {},
  cashCounts: {},
  bankTransfers: {},
});

export interface StationRecord {
  name: string;
  has_sv4: boolean;
  has_parking: boolean;
}
export const defaultStations: StationRecord[] = [
  { name: "Noida Electronic City", has_sv4: true, has_parking: true },
  { name: "Sector 62 Noida", has_sv4: false, has_parking: false },
];

export type DetailListKind =
  | "outsourceEarning"
  | "miscEarning"
  | "penaltyDetails";


