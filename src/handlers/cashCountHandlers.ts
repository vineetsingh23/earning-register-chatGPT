import type { RegisterState } from "../lib/registerTypes";
import { parseNumber } from "../lib/earningColumns";

// writes one note / coin / loose coin count; counts not typed yet start from the automatic ones
export function updateCashCount(
  state: RegisterState,
  date: string,
  countsShownOnScreen: Record<string, number>,
  countKey: string,
  typedValue: string,
) {
  state.cashCounts[date] = {
    ...(state.cashCounts[date] ?? countsShownOnScreen),
    [countKey]: parseNumber(typedValue),
  };
}
