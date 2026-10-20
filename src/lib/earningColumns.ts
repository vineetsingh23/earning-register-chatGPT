import type { RegisterRow } from "./registerTypes";

export interface ColumnLeaf {
  fieldKey: string;
  label: string;
  kind: "text" | "number" | "calculated";
  formula?: (row: RegisterRow) => number;
  showAsCurrency?: boolean;
}
export interface ColumnGroup {
  label: string;
  children: ColumnNode[];
}
export type ColumnNode = ColumnLeaf | ColumnGroup;

export const isColumnGroup = (node: ColumnNode): node is ColumnGroup =>
  "children" in node;
export const columnDepth = (node: ColumnNode): number =>
  isColumnGroup(node) ? 1 + Math.max(...node.children.map(columnDepth)) : 1;
export const collectLeafColumns = (node: ColumnNode): ColumnLeaf[] =>
  isColumnGroup(node) ? node.children.flatMap(collectLeafColumns) : [node];

export const parseNumber = (value: unknown): number => {
  const parsed = parseFloat(String(value ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const textColumn = (fieldKey: string, label: string): ColumnLeaf => ({
  fieldKey,
  label,
  kind: "text",
});
const numberColumn = (fieldKey: string, label: string): ColumnLeaf => ({
  fieldKey,
  label,
  kind: "number",
});
const calculatedColumn = (
  fieldKey: string,
  label: string,
  formula: (row: RegisterRow) => number,
): ColumnLeaf => ({
  fieldKey,
  label,
  kind: "calculated",
  formula,
  showAsCurrency: true,
});
const columnGroup = (
  label: string,
  ...children: ColumnNode[]
): ColumnGroup => ({ label, children });
const quantityAmountColumns = (
  quantityKey: string,
  amountKey: string,
  amountCode: string,
): ColumnLeaf[] => [
  numberColumn(quantityKey, "Qty"),
  numberColumn(amountKey, `Amt (${amountCode})`),
];
const quantityAmountPlain = (
  quantityKey: string,
  amountKey: string,
): ColumnLeaf[] => [
  numberColumn(quantityKey, "Qty"),
  numberColumn(amountKey, "Amount"),
];

// Field keys are the column codes printed in the register (a, b, h1 ...). Sum of several fields of one row:
const sumOfFields = (row: RegisterRow, fieldKeys: string): number =>
  fieldKeys
    .split(" ")
    .reduce((total, fieldKey) => total + parseNumber(row[fieldKey]), 0);

export const ticketSaleNet = (row: RegisterRow) =>
  sumOfFields(row, "a b e") - sumOfFields(row, "d f g");
export const addValueNet = (row: RegisterRow) =>
  sumOfFields(row, "h1 h2") - sumOfFields(row, "i");
export const surchargeTotal = (row: RegisterRow) =>
  sumOfFields(row, "j k n1 n2");
export const penaltyTotal = (row: RegisterRow) => sumOfFields(row, "t u v");
export const cashlessTotal = (row: RegisterRow) =>
  sumOfFields(row, "aa1 ab1 ac ad ae ab2 aa2 af w4");
export const afcCollectionTotal = (row: RegisterRow) =>
  ticketSaleNet(row) + addValueNet(row) + surchargeTotal(row);
export const totalEarning = (row: RegisterRow) =>
  afcCollectionTotal(row) +
  sumOfFields(row, "n o w y1 y2 y3 t u v") -
  sumOfFields(row, "r s1 s2 x");
export const cashDepositedByOperator = (row: RegisterRow) =>
  totalEarning(row) -
  cashlessTotal(row) -
  sumOfFields(row, "ag ah aj ak") +
  sumOfFields(row, "oe al am");

// ---- shift entry sheet ----
export const shiftEntryColumns: ColumnNode[] = [
  textColumn("cc", "CCC/TOM/RCTM/SCVM No."),
  textColumn("nm", "Name of Operator"),
  textColumn("em", "Employee No."),
  textColumn("st", "Start of Shift Time"),
  textColumn("en", "End of Shift Time"),
  textColumn("sn", "Shift No."),
  columnGroup(
    "QR Tickets",
    columnGroup(
      "QR Tickets Sale",
      numberColumn("fe", "Free Exit Qty"),
      ...quantityAmountColumns("aq", "a", "a"),
    ),
    columnGroup("Paid Exit QR", ...quantityAmountColumns("bq", "b", "b")),
    columnGroup("QR Refund", ...quantityAmountColumns("dq", "d", "d")),
  ),
  columnGroup(
    "Contactless Smart Card (CSC)",
    columnGroup(
      "CSC Sale (TOM/CCC)",
      numberColumn("s26", "SV-2 & SV-6 Qty"),
      numberColumn("t13", "T-1 & T-3 Qty"),
      numberColumn("e", "Total Amt (e)"),
    ),
    columnGroup("CSC Sale Cancel", ...quantityAmountColumns("fq", "f", "f")),
    columnGroup(
      "CSC Refund",
      numberColumn("gs", "SV-2 Qty"),
      numberColumn("gt", "T-1 & T-3 Qty"),
      numberColumn("g", "Amt (g)"),
    ),
    columnGroup(
      "Add Value",
      columnGroup("SV2 TOM", ...quantityAmountColumns("h1q", "h1", "h1")),
      columnGroup("NCMC TOM", ...quantityAmountColumns("h2q", "h2", "h2")),
    ),
    columnGroup("Add Value Cancel", ...quantityAmountColumns("iq", "i", "i")),
  ),
  columnGroup(
    "Surcharge (CCC)",
    columnGroup(
      "By Cash/Cashless (other than Purse)",
      ...quantityAmountColumns("jq", "j", "j"),
    ),
    columnGroup(
      "By Purse using AFC System",
      ...quantityAmountColumns("kq", "k", "k"),
    ),
    columnGroup(
      "NCMC through Cash/POS/QR",
      ...quantityAmountColumns("n1q", "n1", "NC1"),
    ),
    columnGroup(
      "NCMC through Purse",
      ...quantityAmountColumns("n2q", "n2", "NC2"),
    ),
  ),
  calculatedColumn(
    "X",
    "Total Collection by AFC System (X)",
    afcCollectionTotal,
  ),
  numberColumn("n", "E.I.B. (n)"),
  columnGroup(
    "Top-up in SV-4 Cards (o)",
    ...quantityAmountColumns("oq", "o", "o"),
  ),
  columnGroup(
    "Refund Readable CSC (CR)",
    ...quantityAmountColumns("rq", "r", "r"),
  ),
  columnGroup(
    "Manual Refund of Tour Card",
    ...quantityAmountColumns("s1q", "s1", "s1"),
  ),
  columnGroup(
    "Manual Refund of Security Deposit",
    ...quantityAmountColumns("s2q", "s2", "s2"),
  ),
  columnGroup(
    "Penalty",
    columnGroup(
      "Manual Receipt Penalty",
      ...quantityAmountColumns("tq", "t", "t"),
    ),
    columnGroup("HHT Penalty (Cash)", ...quantityAmountColumns("uq", "u", "u")),
    columnGroup(
      "HHT Penalty (Purse)",
      ...quantityAmountColumns("vq", "v", "v"),
    ),
  ),
  numberColumn("w", "Miscellaneous Earning (w)"),
  columnGroup(
    "Manual Refund (if any) QR",
    ...quantityAmountColumns("xq", "x", "x"),
  ),
  columnGroup(
    "Parking (Y)",
    numberColumn("y1", "Manual Cash (y1)"),
    numberColumn("y2", "HHT Cash (y2)"),
    numberColumn("y3", "HHT Purse (y3)"),
  ),
  calculatedColumn("Z", "Total Earning (Z)", totalEarning),
  columnGroup(
    "Cashless Details (CD)",
    numberColumn("aa1", "POS at CCC (aa1)"),
    numberColumn("ab1", "POS at TVM (ab1)"),
    numberColumn("ac", "Static QR at CCC (ac)"),
    numberColumn("ad", "POS at RCTM (ad)"),
    numberColumn("ae", "POS at SCVM (ae)"),
    numberColumn("ab2", "UPI at TVM (ab2)"),
    numberColumn("aa2", "UPI at TOM/CC (aa2)"),
    numberColumn("af", "HHT Penalty Purse (af)"),
    numberColumn("w4", "HHT Parking Purse (w4)"),
    columnGroup(
      "Surcharge Adjustment",
      numberColumn("ag", "Through Purse by AFC at CCC (ag)"),
      numberColumn("ah", "Through purse in NCMC by AFC at CCC (ah)"),
    ),
  ),
  numberColumn("oe", "Outsource Earning (OE)"),
  columnGroup(
    "Outstanding Details",
    columnGroup(
      "Current",
      numberColumn("aj", "AFC (aj)"),
      numberColumn("ak", "Misc (ak)"),
      numberColumn("an", "TVM Mutilated/Fake Notes"),
    ),
    columnGroup(
      "Paid",
      numberColumn("al", "AFC (al)"),
      numberColumn("am", "Misc (am)"),
    ),
  ),
  calculatedColumn(
    "TC",
    "Total Cash Deposited by Operator",
    cashDepositedByOperator,
  ),
];

export interface StationFacilities {
  hasSv4Recharge: boolean;
  hasParking: boolean;
}
// stations without SV-4 recharge or parking do not show those columns
export const filterByFacilities = (
  columns: ColumnNode[],
  facilities: StationFacilities,
): ColumnNode[] => {
  const hiddenLabels = [
    ...(facilities.hasSv4Recharge ? [] : ["Top-up in SV-4 Cards (o)"]),
    ...(facilities.hasParking ? [] : ["Parking (Y)", "HHT Parking Purse (w4)"]),
  ];
  const keepVisible = (nodes: ColumnNode[]): ColumnNode[] =>
    nodes
      .filter((node) => !hiddenLabels.includes(node.label))
      .map((node) =>
        isColumnGroup(node)
          ? { ...node, children: keepVisible(node.children) }
          : node,
      );
  return keepVisible(columns);
};

// ---- TVM earning sheet ----
export const tvmTotal = (row: RegisterRow) => sumOfFields(row, "qa va na ra");
export const tvmFinalTotal = (row: RegisterRow) =>
  tvmTotal(row) - sumOfFields(row, "pos up os");
export const tvmEarningColumns: ColumnNode[] = [
  textColumn("no", "TVM No."),
  columnGroup("QR Sales", ...quantityAmountPlain("qq", "qa")),
  columnGroup("Add Value", ...quantityAmountPlain("vq", "va")),
  columnGroup("Add Value NCMC", ...quantityAmountPlain("nq", "na")),
  columnGroup("RCTM Add Value", ...quantityAmountPlain("rq", "ra")),
  calculatedColumn("tt", "Total", tvmTotal),
  columnGroup(
    "Cashless Transaction",
    numberColumn("pos", "Payment by POS"),
    numberColumn("up", "Payment by UPI"),
  ),
  numberColumn("os", "Outstanding (current)"),
  calculatedColumn("tf", "Final Total", tvmFinalTotal),
];

// ---- final earning sheet: shift + TVM, common headers grouped ----
export const tvmFieldPrefix = "tvm:";
const tvmField = (fieldKey: string, label: string) =>
  numberColumn(tvmFieldPrefix + fieldKey, label);

export const buildFinalEarningColumns = (
  shiftColumns: ColumnNode[],
): ColumnNode[] => {
  const operatorIdentityFields = ["cc", "nm", "em", "st", "en", "sn"];
  const regroup = (nodes: ColumnNode[]): ColumnNode[] =>
    nodes.flatMap((node): ColumnNode[] => {
      if (
        !isColumnGroup(node) &&
        operatorIdentityFields.includes(node.fieldKey)
      )
        return [];
      if (isColumnGroup(node) && node.label === "QR Tickets Sale") {
        return [
          columnGroup(
            "QR Sale",
            columnGroup(
              "TOM QR Sale",
              numberColumn("fe", "Free Exit Qty"),
              numberColumn("aq", "Qty"),
              numberColumn("a", "Amt (a)"),
            ),
            columnGroup("TVM QR", tvmField("qq", "Qty"), tvmField("qa", "Amt")),
          ),
        ];
      }
      if (isColumnGroup(node) && node.label === "Add Value") {
        return [
          columnGroup(
            "Add Value CSC",
            columnGroup(
              "SV2 TOM",
              numberColumn("h1q", "Qty"),
              numberColumn("h1", "Amt (h1)"),
            ),
            columnGroup("TVM", tvmField("vq", "Qty"), tvmField("va", "Amt")),
          ),
          columnGroup(
            "Add Value NCMC",
            columnGroup(
              "NCMC TOM",
              numberColumn("h2q", "Qty"),
              numberColumn("h2", "Amt (h2)"),
            ),
            columnGroup("TVM", tvmField("nq", "Qty"), tvmField("na", "Amt")),
          ),
          columnGroup(
            "RCTM Add Value",
            columnGroup("TVM", tvmField("rq", "Qty"), tvmField("ra", "Amt")),
          ),
        ];
      }
      return [
        isColumnGroup(node)
          ? { ...node, children: regroup(node.children) }
          : node,
      ];
    });
  return regroup(shiftColumns);
};

// TVM figures (keys 'tvm:..') are added into the matching shift figures so every formula counts TVM earning:
// QR sale -> a | add value + RCTM add value -> h1 | NCMC add value -> h2 | POS -> ab1 | UPI -> ab2 | outstanding -> aj
export const mergeTvmIntoShiftRow = (combinedRow: RegisterRow): RegisterRow => {
  const shiftPlusTvm = (shiftKey: string, ...tvmKeys: string[]) =>
    String(
      parseNumber(combinedRow[shiftKey]) +
        tvmKeys.reduce(
          (total, tvmKey) =>
            total + parseNumber(combinedRow[tvmFieldPrefix + tvmKey]),
          0,
        ),
    );
  return {
    ...combinedRow,
    a: shiftPlusTvm("a", "qa"),
    h1: shiftPlusTvm("h1", "va", "ra"),
    h2: shiftPlusTvm("h2", "na"),
    ab1: shiftPlusTvm("ab1", "pos"),
    ab2: shiftPlusTvm("ab2", "up"),
    aj: shiftPlusTvm("aj", "os"),
  };
};
